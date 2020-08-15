var Clients = require('../clients/collection'),
    Actors  = require('../actors/collection');

module.exports = Backbone.Model.extend({
    clients    : null,
    actors     : null,
    unityClient: null,

    prepare: ['initCollections'],

    defaults: {
        destroyIfEmpty: true
    },

    handlers: {
        'destroy'      : 'onDestroy',
        'actors.add'   : 'onActorAdd',
        'actors.remove': 'onActorRemove'
    },

    loadUnityLevel() {
        if (!this.isLoadingLevel && this.config &&
            (this.unityClient && (this.editorClient || this.unityClient.get('development')))) {
            this.isLoadingLevel = true;
            this.isLevelRunning = false;
            this.destroyAllActors();

            this.send('unity', 'loadLevel', {
                unity : this.config.unity,
                actors: this.config.actors
            });
        }
    },

    addClient(client) {
        var type = client.get('type');
        !this.clients[type] && (this.clients[type] = new Clients());

        var addedCliend  = this.clients[type].add(client);
        addedCliend.room = this;

        if (client.isUnityClient()) {
            if (this.unityClient) {
                this.unityClient.socket.disconnect();
                this.unityClient.destroy();
            }

            this.editorClient && this.sendEvent('editor', 'unityClientConnected');

            this.unityClient = addedCliend;
        }

        if (client.isEditorClient()) {
            if (this.editorClient) {
                this.editorClient.socket.disconnect();
                this.editorClient.destroy();
            }
            this.editorClient = addedCliend;
        }

        this.loadUnityLevel();
    },

    addActor(options) {
        var actor = this.actors.add(options || {});
        return actor.id;
    },

    onActorAdd(actor) {
        //this.send('unity', 0, )
    },

    onActorRemove() {

    },

    onClientDestroy(client) {
        if (client.isEditorClient()) {
            this.config = null;
        }

        var destroy = true;
        for (let key in this.clients) {
            if (this.clients[key].length) {
                destroy = false;
                break;
            }
        }

        if (destroy) {
            console.log('ROOM DESTROYED');
        }
        destroy && this.destroy();
    },

    destroyAllActors() {
        while (this.actors.length) {
            this.actors.first().destroy();
        }
    },

    onDestroy() {
        for (let key in this.clients) {
            if (this.clients[key].length) {
                while (this.clients[key].length) {
                    this.clients[key].first().destroy();
                }
            }
        }

        this.destroyAllActors();
    },

    getApiGetters(props, path = '') {
        var res = {},
            validatedType;

        Object.keys(props).forEach((key) => {
            if (props[key]._isGetter && !props[key]._isHidden) {
                validatedType   = validateType(props[key].type);
                res[path + key] = [validatedType, validators[validatedType](props[key].default)];
            } else {
                if (typeof props[key] == 'object') {
                    _.extend(res, this.getApiGetters(props[key], path + key + '_'));
                }
            }
        });
        return res;
    },

    getActorsProperties(actors) {
        if (!actors) {
            return [];
        }

        return (Array.isArray(actors) ? actors : [actors]).reduce((res, actor) => {
            if (!_.isObject(actor)) {
                console.log("getActorsProperties: Wrong actor");
                return res;
            }

            if (!actor.prefab) {
                console.log("getActorsProperties: actor has no prefab name");
                return res;
            }

            if (!this.config.api[actor.api]) {
                console.warn(`getActorsProperties: Can't find API "${actor.api}" for prefab "${actor.prefab}"`);
                return res;
            }

            var properties    = flattenObject(actor.properties || {}),
                apiProperties = this.config.api[actor.api].properties;

            properties = Object.keys(properties).reduce((res, key) => {
                var getter = deep(apiProperties, key);
                if (getter && getter._isGetter && !getter._isHidden) {
                    var validatedType            = validateType(getter.type);
                    res[key.replace(/\./g, '_')] = [
                        validatedType,
                        validators[validatedType](properties[key], getter.default)
                    ];
                }
                return res;
            }, {});

            apiProperties = this.getApiGetters(apiProperties);
            properties    = Object.keys(apiProperties).map((key) => {
                var target = properties[key] || apiProperties[key];
                return [key, target[0], target[1]];
            });
            console.log(properties);

            res.push(_.extend(actor, {
                id        : actor.id || 0,
                prefab    : actor.prefab.toString(),
                scriptName: (actor.scriptName || '').toString(),
                isPublic  : !!actor.isPublic,
                api       : actor.api.toString(),
                metadata  : JSON.stringify(actor.metadata),
                properties
            }, []));
            return res;
        }, []);
    },

    parseActorsProperties(actors) {
        if (!actors) {
            return [];
        }

        return (Array.isArray(actors) ? actors : [actors]).reduce((res, actor) => {
            if (!_.isObject(actor)) {
                console.log("parseActorsProperties: Wrong actor");
                return res;
            }

            if (!actor.prefab) {
                console.log("parseActorsProperties: actor has no prefab name");
                return res;
            }

            if (!this.config.api[actor.api]) {
                console.warn(`parseActorsProperties: Can't find API "${actor.api}" for prefab "${actor.prefab}"`);
                return res;
            }

            var properties    = actor.properties || {},
                apiProperties = this.config.api[actor.api].properties;

            properties = Object.keys(properties).reduce((res, key) => {
                var pointer = apiProperties,
                    path    = '';
                if (~key.indexOf(key)) {
                    var items = key.split('_'),
                        item;

                    while (items.length) {
                        item = (item ? item + '_' : '') + items.shift();
                        if (pointer[item] && typeof pointer[item] == 'object') {
                            pointer = pointer[item];
                            path += (path ? '.' : '') + item;
                            item    = '';
                        }
                    }
                }

                pointer && pointer._isGetter && !pointer._isHidden && deep(res, path || key, properties[key]);

                return res;
            }, {});

            res.push(_.extend(actor, {
                prefab    : actor.prefab.toString(),
                scriptName: (actor.scriptName || '').toString(),
                isPublic  : !!actor.isPublic,
                api       : actor.api.toString(),
                properties
            }, []));

            return res;
        }, []);
    },

    registerAPI(config) {
        if (!(this.config = config)) {
            console.warn("registerAPI: config is undefined");
            return;
        }

        this.config = deepCopy(this.config);

        this.config.scripts = this.config.scripts || {};
        var api             = (this.config.api = this.config.api || {}),
            loopControl     = 0;

        var extend = (apiItem) => {
            if (apiItem.extends && api[apiItem.extends] && loopControl++ < 1000) {
                var parent        = extend(api[apiItem.extends]);
                parent.properties = parent.properties || {};
                parent.methods    = _.extend(parent.methods || {}, apiItem.methods);
                var props         = flattenObject(apiItem.properties);
                Object.keys(props).forEach((path) => {
                    var pointer   = parent.properties,
                        pathArray = path.split('.');
                    pathArray.forEach((pathItem, index) => {
                        if (index + 1 >= pathArray.length) { //last item
                            pointer[pathItem] = props[path];
                        } else {
                            (typeof pointer[pathItem] != 'object') && (pointer[pathItem] = {});
                            pointer = pointer[pathItem];
                        }
                    });
                });
                return parent;
            }

            return deepCopy(apiItem);
        };

        this.metadata = {};
        Object.keys(api).forEach((apiName) => {
            var metadata            = api[apiName].metadata;
            loopControl             = 0;
            api[apiName].properties = api[apiName].properties || {};
            api[apiName].methods    = api[apiName].methods || {};
            api[apiName].extends && (api[apiName] = extend(api[apiName], api[apiName].extends));
            this.metadata[apiName] = api[apiName].metadata = metadata;
        });

        this.config.actors = this.getActorsProperties(this.config.actors);

        console.log('>', this.config.actors[0].properties);
        if (config.unity) {
            this.loadUnityLevel();
            console.log(`Config ${config.unity.name} loaded`);
        }
    },

    runAllScripts(except, scripts) {
        this.isLevelRunning = true;
        except              = except || [];
        scripts             = scripts || {};

        scripts = Object.keys(scripts).reduce((res, name) => {
            res[name] = scripts[name].content;
            return res;
        }, {});

        this.actors.forEach(async (actor) => {
            !~except.indexOf(actor.id) && actor.scriptRun(scripts);
        });

        this.send('unity', 'play', {
            com: 'play'
        });
    },

    sendQuery(clientType, actor, com, vars) {
        return new Promise((resolve) => {
            actor.resolve = resolve;
            this.application.sendRoomQuery(`${this.id}-${clientType}`, actor.id, com, vars);
        });
    },

    sendEvent(clientType, com, vars) {
        this.application.sendRoomEvent(`${this.id}-${clientType}`, com, vars);
    },

    send(clientType, com, vars) {
        this.application.sendRoom(`${this.id}-${clientType}`, com, vars);
    },

    initCollections() {
        this.clients = {};
        this.actors  = new Actors([], {
            room: this
        });
    },

    launch() {
        this.metadata = {};
    }
});
