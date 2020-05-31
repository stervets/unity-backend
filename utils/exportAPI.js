var UNITY_PATH = '/Users/lisov/UnityProjects/codify';

require("../init/init");
var fs      = require('fs');
var configs = [
    //require('../app/config/test-config'),
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

var validators = {
    int(param, defaultValue) {
        return (param == null && defaultValue != null ? parseInt(defaultValue) : parseInt(param)) || 0;
    },
    float(param, defaultValue) {
        return (param == null && defaultValue != null ? parseFloat(defaultValue) : parseFloat(param)) || 0;
    },
    string(param, defaultValue) {
        return (param == null && defaultValue != null ?
                defaultValue && defaultValue.toString && defaultValue.toString() :
                param && param.toString && param.toString()) || '';
    },
    bool(param, defaultValue) {
        return param == null && defaultValue != null ? !!defaultValue : !!param;
    }
};

var validateType = (type)=>{
    return ~['object', 'function', 'array'].indexOf(type) ? 'string' : type;
};

if (fs.statSync(UNITY_PATH).isDirectory()) {
    configs.forEach((config) => {
        var levelName      = config.unity.name;
        var [realm, level] = levelName.split('/'),
            path           = `${UNITY_PATH}/Assets/Realms/${realm}/Levels/${level}`;

        if (fs.statSync(path).isDirectory()) {
            path += '/API';
            //console.log('check path', fs.statSync(path).isDirectory(), path);
            try {
                fs.statSync(path).isDirectory();
            } catch (e) {
                console.log('CREATE DIR', path);
                fs.mkdirSync(path);
            }

            var dir = fs.opendirSync(path), file;
            while (file = dir.readSync()) {
                if (file.isFile()) {
                    fs.unlinkSync(`${path}/${file.name}`);
                }
            }

            Object.keys(config.api).forEach((apiName) => {
                var filename = `API_${apiName}`,
                    methods  = deepCopy(config.api[apiName].methods || {});

                var findGetters = (properties, path) => {
                    path = path || '';
                    Object.keys(properties).forEach((name) => {
                        if (typeof properties[name] == 'object') {
                            if (properties[name]._isGetter) {
                                let pathName      = (path ? path + '_' : '') + name,
                                    getter = `get_${pathName}`,
                                    responser = `on_get_${pathName}`,
                                    setter = `set_${pathName}`,
                                validatedType = validateType(properties[name].type);

                                methods[getter] = {
                                    desc  : properties[name].desc,
                                    type   : validatedType,
                                    content: `return ${JSON.stringify(validators[validatedType](null, properties[name].default))};`,
                                    params: []
                                };

                                methods[responser] = {
                                    desc  : `Response ${responser}`,
                                    content: `SendResult(JSON.@${properties[name].type}(${getter}()));`,
                                    params: []
                                };

                                if (!properties[name]._isHidden) {
                                    methods[setter] = {
                                        desc   : `Setter ${setter}`,
                                        type   : validateType(properties[name].type),
                                        content: `return ${getter}();`,
                                        params : [{
                                            name,
                                            type: properties[name].type,
                                            desc: properties[name].desc
                                        }]
                                    };
                                }
                            } else {
                                findGetters(properties[name], path ? `${path}_${name}` : name);
                            }
                        }
                    });
                };
                findGetters(config.api[apiName].properties || {});

                var extendsApi = config.api[apiName].extends,
                    content    = `/*     
    API: ${apiName}      
                  
    Level: ${levelName} 
    ${config.desc}
*/
using UnityEngine;
namespace ${levelName.replace(/\//g, '_')} {
public class ${filename} : ${extendsApi ? 'API_' + extendsApi : 'ActorController'} {\n`;

                content += Object.keys(methods).map((method) => {
                    var content = `
    /*
      ${method}: ${methods[method].desc}\n`;
                    content += (methods[method].params || []).map((param) => {
                        return `      ${param.name} (${param.type}): ${param.desc}\n`;
                    }).join('');

                    content += `    */
    public virtual ${methods[method].type || 'void'} ${method}(`;

                    content += (methods[method].params || []).map((param) => {
                        return `${validateType(param.type)} ${param.name}`;
                    }).join(', ');

                    return content + `) { ${methods[method].content || 'SendResult();'} }\n`;
                }).join('');

                content += '}\n}';

                fs.writeFileSync(`${path}/${filename}.cs`, content);
            });
        } else {
            console.log(`Path for ${levelName} not found: ${path}`);
        }
    });
} else {
    console.log(`UNITY_PATH ${UNITY_PATH} doesn't exist`);
}
