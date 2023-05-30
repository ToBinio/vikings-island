type Err<T> = {
    err: T;
    ok?: never;
};

type Ok<U> = {
    err?: never;
    ok: U;
};

export type Result<T, U> = NonNullable<Err<T> | Ok<U>>;