var UNITY_PATH = '/Users/lisov/UnityProjects/codify';

require("../init/init");
var fs      = require('fs');
var configs = [
    //require('../app/config/test-config'),
    require('../app/config/test-config-level2'),
];

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
                                    getter        = `get_${pathName}`,
                                    responser     = `on_get_${pathName}`,
                                    setter        = `set_${pathName}`,
                                    validatedType = validateType(properties[name].type);

                                methods[getter] = {
                                    desc   : properties[name].desc,
                                    type   : validatedType,
                                    content: `return ${JSON.stringify(validators[validatedType](properties[name].default))};`,
                                    params : []
                                };

                                methods[responser] = {
                                    desc   : `Response ${responser}`,
                                    content: `SendResult(JSON.@${properties[name].type}(${getter}()));`,
                                    params : []
                                };

                                if (!properties[name]._isHidden) {
                                    methods[setter] = {
                                        desc   : `Setter ${setter}`,
                                        type   : validatedType,
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
