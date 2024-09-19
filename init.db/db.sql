USE queue_db;

CREATE TABLE IF NOT EXISTS messages (
  id  int auto_increment primary key,
  payload json not null,
  status varchar(100) default 'create'  not null,
  queue_name varchar(255) not null,
  scheduled_at datetime not null,
  created_at     datetime     default CURRENT_TIMESTAMP not null,
  updated_at     datetime     null
);