(function () {
    var t, n, e, i, r, a, o, l = [].slice;
    e = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", i = e.length, this.BackbonePrepare = global.BackbonePrepare = n = [], this.BackboneLaunchStatus = { INIT: 0, PREPARE: 1, PREPARE_FAIL: 2, READY: 4 }, r = function (t) {
        return Array.isArray(t) ? t : t.split(",").map(function (t) {
            return t.trim()
        })
    }, o = function (t, n) {
        for (null == t && (t = 16), null == n && (n = ""); t-- > 0;) n += e.charAt(Math.floor(Math.random() * i)), !t || t % 4 || (n += "-");
        return n
    }, Backbone.BackboneInitializeNoWarnings = !1, t = function () {
        function t(t) {
            var n, e, i;
            if (this.entity = t, null == this.entity.noBind) {
                i = this.entity;
                for (e in i) n = i[e], "function" == typeof n && (this.entity[e] = n.bind(this.entity))
            }
            this.entity.addHandler = this.addHandler.bind(this), this.entity.executeChain = this.executeChain.bind(this), this.handlers = {}, this.entity.launchStatus = BackboneLaunchStatus.INIT
        }

        return t.prototype.handlers = null, t.prototype.entity = null, t.prototype.warn = function (t) {
            if (!Backbone.BackboneInitializeNoWarnings) return console.warn("Backbone-initialize warn: " + t)
        }, t.prototype.getChild = function (t, n, e) {
            var i;
            return null == e && (e = this.entity), i = t.shift(), null != e[i] ? t.length ? this.getChild(t, n, e[i]) : e[i] : (this.warn(i + " undefined (this." + n + ")"), null)
        }, t.prototype.eventHandler = function (t) {
            var n;
            return n = this.handlers[t], function (t) {
                return function () {
                    var e;
                    return e = 1 <= arguments.length ? l.call(arguments, 0) : [], t.executeChain(n, e)
                }
            }(this)
        }, t.prototype.executeChain = function (t, n, e, i, r) {
            var a, o;
            return null == e && (e = this.entity), n = n || [], null == i && (i = $.Deferred(), t = t.slice(), a = i.promise(), a.defer = i), o = t.shift(), $.when(o.apply(e, n.concat(r || [])))
                                                                                                                                                              .done(function (r) {
                                                                                                                                                                  return function () {
                                                                                                                                                                      var a;
                                                                                                                                                                      return a = 1 <= arguments.length ?
                                                                                                                                                                                 l.call(arguments, 0) :
                                                                                                                                                                                 [], t.length ?
                                                                                                                                                                                     r.executeChain(t, n, e, i, a) :
                                                                                                                                                                                     i.resolve.apply(e, n.concat(a || []))
                                                                                                                                                                  }
                                                                                                                                                              }(this)).fail(function () {
                    var t;
                    return t = 1 <= arguments.length ? l.call(arguments, 0) : [], Backbone.BackboneInitializeNoWarnings || console.warn("Deferred chain fail", o), i.reject.apply(e, n.concat(t || []))
                }), a
        }, t.prototype.addListener = function (t, n, e, i) {
            var r;
            return null == t._bbId && (t._bbId = o()), r = t._bbId + "-" + n, null == this.handlers[r] && (this.handlers[r] = [], this.entity.listenTo(t, n, this.eventHandler(r))), this.handlers[r].push(e.bind(i))
        }, t.prototype.addHandler = function (t, n, e) {
            var i, a, o;
            if (null == e && (e = this.entity), "object" == typeof t) {
                a = [];
                for (i in t) o = t[i], a.push(this.addHandler(i, o, e));
                return a
            }
            return "object" != typeof n || Array.isArray(n) ?
                   ("string" == typeof n && (n = r(n)), Array.isArray(n) || (n = [n]), n = n.slice(), "_" === t[0] && (t = n.shift()), r(t).forEach(function (t) {
                       return function (i) {
                           var r, a;
                           if (r = e, a = i.split("."), i = a.pop(), !a.length || (r = t.getChild(a, a.join("."), r))) return n.forEach(function (n) {
                               var e, a, o;
                               if (a = !1, o = t.entity, "string" == typeof n) {
                                   if (a = n, e = n.split("."), n = e.pop(), !(o = e.length ? t.getChild(e, a) : t.entity)) return;
                                   n = o[n]
                               }
                               return "function" == typeof n ? t.addListener(r, i, n, o) : t.warn("Can't find handler for \"" + i + '"' + (a ? ': "' + a + '"' : ""))
                           })
                       }
                   }(this))) : void r(t).forEach(function (t) {
                    return function (r) {
                        var a, o, l;
                        if (a = t.getChild(r.split("."), r, e)) {
                            o = [];
                            for (i in n) l = n[i], o.push(t.addHandler(i, l, a));
                            return o
                        }
                        return t.warn("Can't append handlers to " + r + " cause child not found")
                    }
                }(this))
        }, t.prototype.addHandlers = function () {
            if (null != this.entity.handlers && !this.entity.disableHandlers) return this.addHandler(this.entity.handlers)
        }, t.prototype.launch = function () {
            var t, n, e;
            return t = arguments[0], n = 2 <= arguments.length ? l.call(arguments, 1) :
                                         [], null != t && this.addHandlers(), this.entity.launchStatus = BackboneLaunchStatus.READY, (e = this.entity).trigger.apply(e, ["launch"].concat(l.call(n)))
        }, t.prototype.prepares = null, t.prototype.prepareAndLaunch = function (t) {
            var e;
            return this.entity.firstLaunch = null != this.prepares, (n.length || Array.isArray(this.entity.prepare)) && (null == this.prepares && ((e = this.entity).prepare || (e.prepare = []), this.entity.prepare = n.concat(this.entity.prepare), this.prepares = this.entity.prepare.map(function (t) {
                return function (n) {
                    var e;
                    return e = "function" == typeof n ? n : t.entity[n], "function" != typeof e && (t.warn("Prepare item " + n + " isn't function"), e = $.noop), e
                }
            }(this))), this.prepares.length) ?
                                                                    (this.entity.launchStatus = BackboneLaunchStatus.PREPARE, this.entity.promise = this.executeChain(this.prepares, t), this.entity.promise.done(function (n) {
                                                                        return function () {
                                                                            return n.launch.apply(n, [n.entity.firstLaunch].concat(l.call(t)))
                                                                        }
                                                                    }(this)).fail(function (n) {
                                                                        return function () {
                                                                            var e;
                                                                            if (Backbone.BackboneInitializeNoWarnings || console.warn("Backbone initialize prepares fail: ", n.prepares), n.entity.launchStatus = BackboneLaunchStatus.PREPARE_FAIL, "function" == typeof n.entity.onLaunchFail) return (e = n.entity).onLaunchFail.apply(e, t)
                                                                        }
                                                                    }(this)), this.entity.promise) : this.launch.apply(this, [this.entity.firstLaunch].concat(l.call(t)))
        }, t
    }(), a = function () {
        var n, e, i, a, o;
        if (a = 1 <= arguments.length ? l.call(arguments, 0) :
                [], i = this.options, null == i && (i = a[1]), "string" == typeof this.prepare && (this.prepare = r(this.prepare)), "object" == typeof this.handlers || null != (null != i ? i.attach :
                                                                                                                                                                                 void 0) || "function" == typeof this.launch || Array.isArray(this.prepare)) {
            if (this._bbInitialize = new t(this), "function" == typeof this.launch && this.addHandler("launch", this.launch), null != (null != i ? i.attach : void 0)) {
                o = i.attach;
                for (n in o) e = o[n], this[n] = e
            }
            return this.relaunch = function (t) {
                return function () {
                    return t._bbInitialize.prepareAndLaunch(a)
                }
            }(this), this.relaunch()
        }
    }, Backbone.Model.prototype.initialize = a, Backbone.Collection.prototype.initialize = a, Backbone.View.prototype.initialize = a, null != Backbone.NestedModel && (Backbone.NestedModel.prototype.initialize = a), null != Backbone.Layout && (Backbone.Layout.prototype.initialize = a), "undefined" != typeof Marionette && null !== Marionette && (Marionette.Object.prototype.initialize = a)
}).call(this);
