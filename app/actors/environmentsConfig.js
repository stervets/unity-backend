var environments = {
    StageController: require('./environments/StageConroller'),
    CharacterFemale: require('./environments/CharacterFemale'),
};

_                    = require("lodash");
_.extend(this, environments);
