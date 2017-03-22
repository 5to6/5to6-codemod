const exported = {
    a: 14,

    b: function(user) {
        console.warn('user', user);
    },

    c: {
        sample: 42
    }
};
export default exported;

export const {
    a,
    b,
    c
} = exported;
