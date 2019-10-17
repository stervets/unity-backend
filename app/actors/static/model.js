module.exports = Backbone.Model.extend({
    interpreter: null,
    defaults   : {
        prefabName: '',
        position: { x: 0, y: 0, z: 0 },
        rotation : { x: 0, y: 0, z: 0 },
        scale : { x: 1, y: 1, z: 1 }
    }
});


