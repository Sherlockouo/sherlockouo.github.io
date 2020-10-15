create table renren_fast.author_activity
(
    id          bigint auto_increment
        primary key,
    create_time timestamp default CURRENT_TIMESTAMP null,
    modify_time timestamp default CURRENT_TIMESTAMP null,
    theme_name  varchar(256)                        null,
    theme       varchar(256)                        null,
    date        timestamp default CURRENT_TIMESTAMP null comment 'yyyy-MM-dd',
    people      varchar(256)                        null,
    result_id   bigint                              null
)
    comment '活动';

create table renren_fast.author_books
(
    id           bigint auto_increment
        primary key,
    modify_date  timestamp default CURRENT_TIMESTAMP null,
    create_date  timestamp default CURRENT_TIMESTAMP null,
    name         varchar(256)                        not null,
    content      varchar(256)                        null,
    cover        varchar(256)                        null,
    is_published int                                 null,
    publisher    varchar(256)                        null
);

create table renren_fast.author_customer_service
(
    id          bigint auto_increment
        primary key,
    create_time timestamp default CURRENT_TIMESTAMP null,
    modify_time timestamp default CURRENT_TIMESTAMP null,
    cs_name     varchar(256)                        not null,
    cs_log_id   bigint                              not null
)
    comment '客服表';

create table renren_fast.author_cslog
(
    id    bigint auto_increment
        primary key,
    cs_id bigint null,
    log   text   not null,
    constraint author_cslog_author_customer_service_id_fk
        foreign key (cs_id) references renren_fast.author_customer_service (id)
)
    comment '客服记录表';

create table renren_fast.author_department
(
    id          bigint auto_increment
        primary key,
    name        varchar(256)                        not null,
    size        int       default 0                 null,
    create_time timestamp default CURRENT_TIMESTAMP null,
    modify_time timestamp default CURRENT_TIMESTAMP null,
    constraint author_department_name_uindex
        unique (name)
);

create table renren_fast.author_order
(
    id          bigint auto_increment
        primary key,
    create_time timestamp default CURRENT_TIMESTAMP null,
    modify_time timestamp default CURRENT_TIMESTAMP null,
    book_name   varchar(256)                        not null,
    order_time  timestamp default CURRENT_TIMESTAMP null
)
    comment '订单表';

create table renren_fast.author_result
(
    id          bigint auto_increment
        primary key,
    result      varchar(256)                        not null,
    create_time timestamp default CURRENT_TIMESTAMP null,
    modify_time timestamp default CURRENT_TIMESTAMP null
)
    comment '活动结果';

create table renren_fast.author_storage
(
    id           bigint auto_increment
        primary key,
    create_time  timestamp default CURRENT_TIMESTAMP null,
    modify_time  timestamp default CURRENT_TIMESTAMP null,
    storage_name varchar(256)                        not null,
    place        varchar(256)                        null,
    book_type    varchar(256)                        null,
    book_num     int                                 null
)
    comment '仓库';

