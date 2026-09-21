create table talent_profiles (
                                 id uuid primary key,
                                 user_id uuid not null unique,
                                 profile_type varchar(30) not null,
                                 headline varchar(180) not null,
                                 biography varchar(2000) not null,
                                 location varchar(120) not null,
                                 profile_photo_url text,
                                 curriculum_url text,
                                 status varchar(30) not null,
                                 created_at timestamp not null default current_timestamp,
                                 updated_at timestamp not null default current_timestamp
);

create table profile_skills (
                                id uuid primary key,
                                profile_id uuid not null references talent_profiles(id) on delete cascade,
                                name varchar(100) not null,
                                level varchar(30) not null,
                                years_of_experience integer not null
);

create table profile_portfolio_items (
                                         id uuid primary key,
                                         profile_id uuid not null references talent_profiles(id) on delete cascade,
                                         title varchar(150) not null,
                                         description varchar(1000) not null,
                                         asset_url text,
                                         project_url text
);

create table profile_ratings (
                                 id uuid primary key,
                                 profile_id uuid not null references talent_profiles(id) on delete cascade,
                                 reviewer_user_id uuid not null,
                                 reviewer_type varchar(30) not null,
                                 stars integer not null,
                                 recommended boolean not null,
                                 comment varchar(1000),
                                 created_at timestamp not null
);

create index idx_talent_profiles_user_id on talent_profiles(user_id);
create index idx_talent_profiles_profile_type on talent_profiles(profile_type);
create index idx_profile_skills_profile_id on profile_skills(profile_id);
create index idx_profile_ratings_profile_id on profile_ratings(profile_id);