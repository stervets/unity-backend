var environments = {
    StageController: require('./environments/StageConroller'),
};

_                    = require("lodash");
_.extend(this, environments);
