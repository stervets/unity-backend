var UNITY_PATH = '/Users/lisov/UnityProjects/codify';

var fs      = require('fs');
var configs = [
    require('../app/config/test-config'),
    require('../app/config/test-config-level2'),
];

var deepCopy      = (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },
    flattenObject = function (obj, levelOptions, _level, _concatPath, _overrideMaxLevel) {
        var result   = {}, path, writeResult, realMaxLevel;
        _concatPath  = _concatPath ? _concatPath + '.' : '';
        levelOptions = levelOptions || 0;
        _level       = _level || 1;
        if (typeof levelOptions == 'object' && _overrideMaxLevel == null) {
            _overrideMaxLevel = levelOptions.defaultLevel || 0;
        }
        for (var key in obj) {
            path = _concatPath + key;
            if (!obj.hasOwnProperty(key) || (_overrideMaxLevel != null && levelOptions.disabled && levelOptions.disabled.indexOf(path) >= 0)) continue;
            writeResult = true;

            if (typeof obj[key] == 'object') {
                realMaxLevel = _overrideMaxLevel == null ? levelOptions :
                               (levelOptions.levels[_concatPath + key] != null ? levelOptions.levels[path] : _overrideMaxLevel);
                if (!realMaxLevel || _level < realMaxLevel) {
                    var flatObject = flattenObject(obj[key], levelOptions, _level + 1, path, _overrideMaxLevel == null ? null : realMaxLevel);
                    if (Object.keys(flatObject).length) {
                        for (var resultPath in flatObject) {
                            if (!flatObject.hasOwnProperty(resultPath)) continue;
                            result[key + '.' + resultPath] = flatObject[resultPath];
                        }
                    } else {
                        result[key] = _.deepClone(obj[key]);
                    }

                    writeResult = false;
                }
            }

            if (writeResult) {
                result[key] = typeof obj[key] == 'object' ? _.deepClone(obj[key]) : obj[key];
            }
        }
        return result;
    };

if (fs.statSync(UNITY_PATH).isDirectory()) {
    configs.forEach((config) => {
        var [realm, level] = config.level.split('/'),
            path           = `${UNITY_PATH}/Assets/Realms/${realm}/Levels/${level}`;

        if (fs.statSync(path).isDirectory()) {
            path += '/API';
            !fs.statSync(path).isDirectory() && fs.mkdirSync(path);
            Object.keys(config.api).forEach((apiName) => {
                var filename = `API_${apiName}`,
                    methods  = config.api[apiName].methods,
                    content  = `/*     
    API: ${apiName}      
                  
    Level: ${config.level} 
    ${config.desc}
*/
public class ${filename} : ActorController {\n`;

                content += Object.keys(methods).map((method) => {
                    var content = `
    /*
      ${method}: ${methods[method].desc}\n`;
                    content += (methods[method].params || []).map((param) => {
                        return `      ${param.name} (${param.type}): ${param.desc}\n`;
                    }).join('');

                    content += `    */
    public virtual void ${method}(`;

                    content += (methods[method].params || []).map((param) => {
                        return `${param.type} ${param.name}`;
                    }).join(', ');

                    return content + `) { SendResult(); }\n`;
                }).join('');

                content += '}';

                fs.writeFileSync(`${path}/${filename}.cs`, content);
            });
        } else {
            console.log(`Path for ${config.level} not found: ${path}`);
        }
    });
} else {
    console.log(`UNITY_PATH ${UNITY_PATH} doesn't exist`);
}
