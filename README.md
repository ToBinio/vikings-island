## DB

create a `dbSettings.ts` file in `backend/src/db`

### example

``` js
export const dbSettings = {
    DB_NAME: "vikings_island",
    HOST: "tobinio.at",
    USER: "USERNAME",
    PASSWORD: "PASSWORD",
};
```

### Schemas

#### User

``` sql
create table users
(
id        serial primary key,
user_name varchar(64)           not null unique,
password  varchar(255)          not null,
is_admin  boolean default false not null
);
```

#### Player

``` sql
create table players
(
    id      serial primary key,
    user_id integer references users on delete set null,
    game_id integer not null references games on delete cascade,
    gold    integer not null,
    color   char(7) not null
);
```

#### Game

``` sql
create table games
(
id   serial primary key,
name varchar(255) not null,
tick integer      not null
);
```

#### Ship

``` sql
create table ships
(
    id                serial primary key,
    player_id         integer not null references players,
    game_id           integer not null references games on delete cascade,

    ticks_to_move     integer not null,
    max_ticks_to_move integer not null,

    life              integer not null,
    max_life          integer not null,

    upgrade_count     integer not null,

    damage            integer not null,

    x                 integer not null,
    y                 integer not null,
    goal_x            integer,
    goal_y            integer
);
```

#### Island

``` sql
create table islands
(
    id            serial primary key,
    player_id     integer references players,
    game_id       integer not null references games on delete cascade,

    life          integer not null,
    max_life      integer not null,

    upgrade_count integer not null,

    damage        integer not null,

    x             integer not null,
    y             integer not null,

    gold_per_tick integer not null
);
```