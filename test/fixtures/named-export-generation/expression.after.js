const exported = {};
let exported2, exported3;
var exported4;

const exported5 = {
    a: 14,

    b: function(user) {
        console.warn('user', user);
    },

    'c': {
        sample: 42
    },

    "d": 'is for dinosaur'
};

export default exported5;

export const {
    a,
    b,
    c,
    d
} = exported5;
