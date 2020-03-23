var UNITY_PATH = '/Users/lisov/UnityProjects/codify';

var fs      = require('fs');
var configs = [
    require('../app/config/test-config')
];

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
                    content = `/*     
    API: ${apiName}      
                  
    Level: ${config.level} 
    ${config.desc}
*/
public class ${filename} : ActorController {\n`;

                content+=Object.keys(methods).map((method) => {
                    var content = `
    /*
      ${method}: ${methods[method].desc}\n`;
                    content+=(methods[method].params || []).map((param)=>{
                        return `      ${param.name} (${param.type}): ${param.desc}\n`;
                    }).join('');

                    content+=`    */
    public virtual void ${method}(`;

                    content+=(methods[method].params || []).map((param)=>{
                        return `${param.type} ${param.name}`;
                    }).join(', ');

                    return content+`) { SendResult(); }\n`;
                }).join('');

                content+='}';

                fs.writeFileSync(`${path}/${filename}.cs`, content);
            });
        } else {
            console.log(`Path for ${config.level} not found: ${path}`);
        }
    });
} else {
    console.log(`UNITY_PATH ${UNITY_PATH} doesn't exist`);
}