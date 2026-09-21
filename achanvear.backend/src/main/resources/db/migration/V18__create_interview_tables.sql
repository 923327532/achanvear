CREATE TABLE IF NOT EXISTS interviews (
                                          id                       VARCHAR NOT NULL,
                                          hiring_process_id        VARCHAR NOT NULL,
                                          candidate_id             VARCHAR NOT NULL,
                                          type                     VARCHAR NOT NULL,
                                          status                   VARCHAR NOT NULL,
                                          interviewer_profile_code VARCHAR NOT NULL,
                                          interviewer_name         VARCHAR NOT NULL,
                                          interviewer_style        VARCHAR NOT NULL,
                                          interviewer_voice        VARCHAR NOT NULL,
                                          score                    INTEGER,
                                          recording_file_key       VARCHAR,
                                          recording_active         BOOLEAN NOT NULL DEFAULT false,
                                          PRIMARY KEY (id)
    );