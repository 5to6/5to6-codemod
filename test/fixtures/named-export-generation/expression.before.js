const exported = {};
let exported2, exported3;
var exported4;

export default {
    a: 14,

    b: function(user) {
        console.warn('user', user);
    },

    'c': {
        sample: 42
    },

    "d": 'is for dinosaur'
};
