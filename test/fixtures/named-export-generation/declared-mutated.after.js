let exported;
exported = {
    a: 14,

    b: function(user) {
        console.warn('user', user);
    },

    c: {
        sample: 42
    }
};
exported.d = 'some mutated value';
exported.e = {};
exported.f = function(input) { console.warn('input', input); }
export default exported;

export const {
    a,
    b,
    c,
    d,
    e,
    f
} = exported;
