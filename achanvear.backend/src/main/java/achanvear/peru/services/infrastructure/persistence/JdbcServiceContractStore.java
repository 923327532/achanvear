package achanvear.peru.services.infrastructure.persistence;
import achanvear.peru.services.application.ServiceContractStore;
import achanvear.peru.shared.domain.exception.ResourceNotFoundException;
import achanvear.peru.shared.exception.ForbiddenOperationException;
import jakarta.persistence.EntityManager;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public class JdbcServiceContractStore implements ServiceContractStore {
    private final JdbcTemplate jdbc;
    private final EntityManager entities;
    public JdbcServiceContractStore(JdbcTemplate jdbc, EntityManager entities) { this.jdbc=jdbc; this.entities=entities; }
    private static final RowMapper<Contract> CONTRACT=(r,n)->new Contract(r.getObject("id",UUID.class),r.getObject("project_id",UUID.class),
            r.getObject("service_id",UUID.class),r.getObject("plan_id",UUID.class),r.getObject("conversation_id",UUID.class),
            r.getObject("client_user_id",UUID.class),r.getObject("freelancer_user_id",UUID.class),r.getObject("milestone_id",UUID.class),
            r.getString("title"),r.getString("plan_name"),r.getBigDecimal("amount"),r.getInt("delivery_days"),r.getString("currency"),
            r.getString("status"),r.getObject("idempotency_key",UUID.class));
    private static final RowMapper<Offer> OFFER=(r,n)->new Offer(r.getObject("service_id",UUID.class),r.getObject("plan_id",UUID.class),
            r.getObject("freelancer_user_id",UUID.class),r.getString("title"),r.getString("description"),r.getString("category"),
            r.getString("plan_name"),r.getBigDecimal("amount"),r.getInt("delivery_days"),r.getString("currency"));
    public List<VerifiedReview> reviews(UUID serviceId) {
        return jdbc.query("SELECT r.* FROM service_contract_reviews r JOIN service_contracts c ON c.id=r.contract_id WHERE c.service_id=? AND c.status='COMPLETED' ORDER BY r.created_at DESC",
                (r,n)->new VerifiedReview(r.getString("reviewer_user_id"),r.getInt("stars"),r.getString("comment"),r.getTimestamp("created_at").toInstant().toString()),serviceId);
    }
    public Offer quote(UUID serviceId, UUID planId) {
        var found=jdbc.query("""
            SELECT s.id service_id,p.id plan_id,s.freelancer_user_id,s.title,s.description,s.category,
                   COALESCE(p.name,'Plan base') plan_name,COALESCE(p.price,s.base_price) amount,
                   COALESCE(p.delivery_days,s.delivery_days) delivery_days,COALESCE(s.currency,'PEN') currency
            FROM services s LEFT JOIN service_plans p ON p.service_id=s.id AND p.id=? AND p.is_active=true
            WHERE s.id=? AND s.status='ACTIVE' AND s.is_available=true AND (CAST(? AS UUID) IS NULL OR p.id IS NOT NULL)
            FOR UPDATE OF s
            """,OFFER,planId,serviceId,planId);
        if(found.isEmpty()) throw new ResourceNotFoundException("Service or active plan not found");
        return found.get(0);
    }
    public void linkOrigin(UUID conversationId, UUID serviceId, UUID clientId) {
        var offer=quote(serviceId,null);
        if(!Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM chat_conversations WHERE id=? AND company_id=? AND freelancer_id=?)",
                Boolean.class,conversationId,clientId,offer.freelancerId()))) throw new ForbiddenOperationException("Not the client of this conversation");
        jdbc.update("INSERT INTO service_conversation_origins VALUES(?,?) ON CONFLICT DO NOTHING",conversationId,serviceId);
    }
    public boolean canFormalize(UUID conversationId, UUID serviceId, UUID clientId, UUID freelancerId) {
        return Boolean.TRUE.equals(jdbc.queryForObject("""
            SELECT EXISTS(SELECT 1 FROM chat_conversations c JOIN service_conversation_origins o ON o.conversation_id=c.id
              WHERE c.id=? AND c.company_id=? AND c.freelancer_id=? AND o.service_id=?)
            """,Boolean.class,conversationId,clientId,freelancerId,serviceId));
    }
    public List<Offer> offers(UUID conversationId, UUID userId) {
        var ids=jdbc.query("""
            SELECT o.service_id FROM service_conversation_origins o JOIN chat_conversations c ON c.id=o.conversation_id
            WHERE c.id=? AND (c.company_id=? OR c.freelancer_id=?)
            """,(r,n)->r.getObject(1,UUID.class),conversationId,userId,userId);
        if(ids.isEmpty()) return List.of();
        var result=new ArrayList<Offer>();
        for(var id:ids) {
            try { result.add(quote(id,null)); } catch(ResourceNotFoundException ignored) { continue; }
            for(var plan:jdbc.query("SELECT id FROM service_plans WHERE service_id=? AND is_active=true",(r,n)->r.getObject(1,UUID.class),id))
                result.add(quote(id,plan));
        }
        return result;
    }
    public List<Contract> list(UUID conversationId, UUID userId) {
        return jdbc.query("SELECT * FROM service_contracts WHERE conversation_id=? AND (client_user_id=? OR freelancer_user_id=?) ORDER BY created_at DESC",CONTRACT,conversationId,userId,userId);
    }
    public Optional<Contract> findByKey(UUID clientId, UUID key) {
        jdbc.queryForObject("SELECT id FROM users WHERE id=? FOR UPDATE",UUID.class,clientId);
        return jdbc.query("SELECT * FROM service_contracts WHERE client_user_id=? AND idempotency_key=?",CONTRACT,clientId,key).stream().findFirst();
    }
    public Contract lock(UUID id) { return jdbc.query("SELECT * FROM service_contracts WHERE id=? FOR UPDATE",CONTRACT,id).stream().findFirst().orElseThrow(()->new ResourceNotFoundException("Contract not found")); }
    public void save(Contract c) {
        entities.flush();
        jdbc.update("INSERT INTO service_contracts(id,project_id,service_id,plan_id,conversation_id,client_user_id,freelancer_user_id,milestone_id,title,plan_name,amount,delivery_days,currency,status,idempotency_key) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            c.id(),c.projectId(),c.serviceId(),c.planId(),c.conversationId(),c.clientId(),c.freelancerId(),c.milestoneId(),c.title(),c.planName(),c.amount(),c.deliveryDays(),c.currency(),c.status(),c.idempotencyKey());
        jdbc.update("INSERT INTO in_app_notifications(user_id,category,title,message,event_key) VALUES(?,'PAYMENT','Contratacion pendiente','Tienes una contratacion de servicio por aceptar.',?) ON CONFLICT DO NOTHING",c.freelancerId(),"contract:"+c.id());
    }
    public void setStatus(UUID id,String status) { entities.flush(); jdbc.update("UPDATE service_contracts SET status=? WHERE id=?",status,id); }
    public void review(Contract c,UUID reviewer,int stars,String comment) {
        jdbc.update("INSERT INTO service_contract_reviews(contract_id,reviewer_user_id,stars,comment) VALUES(?,?,?,?) ON CONFLICT(contract_id) DO UPDATE SET stars=EXCLUDED.stars,comment=EXCLUDED.comment",c.id(),reviewer,stars,comment);
        jdbc.queryForObject("SELECT id FROM services WHERE id=? FOR UPDATE",UUID.class,c.serviceId());
        jdbc.update("UPDATE services SET rating=(SELECT ROUND(AVG(r.stars),2) FROM service_contract_reviews r JOIN service_contracts c ON c.id=r.contract_id WHERE c.service_id=?),review_count=(SELECT COUNT(*) FROM service_contract_reviews r JOIN service_contracts c ON c.id=r.contract_id WHERE c.service_id=?) WHERE id=?",c.serviceId(),c.serviceId(),c.serviceId());
    }
}
