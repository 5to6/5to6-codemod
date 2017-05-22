const aSource = 14,
    z = 28;

function b(user) {
    console.warn('user', user);
}

function cFunction(foo, bar) {
    return bar, foo;
}

const exported = {
    a: aSource,

    b: b,

    c: cFunction,

    d: 42,
};
export default exported;
