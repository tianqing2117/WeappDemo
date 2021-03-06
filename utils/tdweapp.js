"use strict";
var Config = {};
"function" != typeof Object.assign && (Object.assign = function (e) {
    if (null == e) throw new TypeError("Cannot convert undefined or null to object");
    e = Object(e);
    for (var t = 1; t < arguments.length; t++) {
        var i = arguments[t];
        if (null != i) for (var n in i) Object.prototype.hasOwnProperty.call(i, n) && (e[n] = i[n])
    }
    return e
});
var Util = {
    Store: {
        set: function (e, t) {
            return wx.setStorageSync(e, t), !0
        },
        get: function (e) {
            return wx.getStorageSync(e)
        },
        remove: function (e) {
            return wx.removeStorageSync(e), !0
        }
    },
    random: function () {
        for (var e = 12, t = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890", i = t.length, n = "", s = 0; s < e; s++)n += t.charAt(Math.floor(Math.random() * i));
        return n
    },
    timestamp: function () {
        return (new Date).getTime()
    },
    uuid: function () {
        var e = this.timestamp(), t = this.random();
        return "weapp-" + e + "-" + t
    },
    request: function (e) {
        var t = { appkey: Config.appkey };
        if (this.Store.get("TDSDK_deviceId")) {
            t.deviceId = this.Store.get("TDSDK_deviceId");
        } else {
            var i = this.uuid();
            this.Store.set("TDSDK_deviceId", i), t.deviceId = i
        }
        Object.assign(t, e.data), wx.request({
            url: Config.params.uploadUrl,
            data: JSON.stringify(t),
            method: "POST",
            success: function () {
                e.success && e.success()
            },
            fail: function () {
                e.fail && e.fail()
            }
        })
    }
}, TD = {
    appProfiles: {}, appProfile: function () {
        var e = { sdkVersion: "Weapp+TD+V1.0.2", partner: "" };
        if (Util.Store.get("TDSDK_initTime")) {
            e.initTime = Util.Store.get("TDSDK_initTime");
        } else {
            var t = Util.timestamp();
            Util.Store.set("TDSDK_initTime", t), e.initTime = t
        }
        Object.assign(e, Config.appProfile), this.appProfiles = e
    }, deviceProfiles: {}, deviceProfile: function () {
        var e = {};
        wx.getSystemInfo({
            success: function (t) {
                e.model = t.model.indexOf("<") > -1 ? t.model.split("<")[0] : t.model, e.wechatVersion = t.version, e.pixel = t.windowWidth + "*" + t.windowHeight, e.language = t.language, e.timezone = -(new Date).getTimezoneOffset() / 60, Object.assign(TD.deviceProfiles, e)
            }
        }), wx.getNetworkType({
            success: function (t) {
                var i = t.networkType.toLocaleLowerCase();
                e.connectionType = "wifi" === i ? 0 : 1, "wifi" !== i ? "4g" == i ? e.cellularNetworkType = "LTE" : e.cellularNetworkType = i : e.cellularNetworkType = "OFFLINE", Object.assign(TD.deviceProfiles, e)
            }
        })
    }, session_id: "", session: function (e) {
        var t = {};
        this.session_id || e || (this.session_id = Util.uuid()), t.id = this.session_id, e && (t.id = e), t.pages = [], t.events = [];
        var i = "TDSDK_PAGE_" + t.id;
        Util.Store.get(i) && (t.pages = Util.Store.get(i));
        var n = "TDSDK_EVENT_" + t.id;
        return Util.Store.get(n) && (t.events = Util.Store.get(n)), t.start = Util.timestamp(), t
    }, clearSessionCount: function (e) {
        var t = "TDSDK_PAGE_" + e.id, i = "TDSDK_EVENT_" + e.id;
        Util.Store.remove(t), Util.Store.remove(i)
    }, sessionStart: function () {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function () {
        }, t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : function () {
        }, i = { status: 1 }, n = Util.timestamp();
        Util.Store.get("TDSDK_session_time") ? i.duration = parseInt((n - Util.Store.get("TDSDK_session_time")) / 1e3) : i.duration = 0,
            Util.Store.set("TDSDK_session_time", n), Object.assign(i, this.session()), this.sessionSend(i, e, t)
    }, sessionContinue: function () {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function () {
        }, t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : function () {
        }, i = { status: 2, duration: 0 };
        Object.assign(i, this.session()), this.sessionSend(i, e, t)
    }, sessionFinish: function () {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function () {
        }, t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : function () {
        }, i = { status: 3 }, n = Util.timestamp();
        i.duration = parseInt((n - Util.Store.get("TDSDK_session_time")) / 1e3),
            Util.Store.set("TDSDK_session_time", n), Object.assign(i, this.session()), this.sessionSend(i, e, t)
    }, sessionSend: function (e, t, i) {
        /**********测试添加开始******* */
        console.log(e);
        /**********测试添加结束******* */
        Util.request({
            data: {
                appProfile: this.appProfiles,
                deviceProfile: this.deviceProfiles,
                msgs: [{ type: 2, data: e }]
            }, success: function (i) {
                TD.clearSessionCount(e), t && t(e, i)
            }, fail: function (t) {
                i && i(e, t)
            }
        })
    }, launchTime: 0, launch: function (e) {
        var t = this;
        "appkey" in e || (e.appkey = !1), "appName" in e || (e.appName = !1), "versionName" in e || (e.versionName = "1.0.0"), "versionCode" in e || (e.versionCode = "1"), "autoOnAppShow" in e || (e.autoOnAppShow = !0), "autoOnAppHide" in e || (e.autoOnAppHide = !0), "autoOnPageUnload" in e || (e.autoOnPageUnload = !0), "autoOnPullDownRefresh" in e || (e.autoOnPullDownRefresh = !0), "autoOnReachBottom" in e || (e.autoOnReachBottom = !0), "autoOnShare" in e || (e.autoOnShare = !0), e.appkey || (e.appkey = "", console.error("请填写您在TalkingData申请的App ID")), e.appName || (e.appName = "appname", console.error("请填写您的小程序名称")), Config = {
            appkey: e.appkey,
            appProfile: { appName: e.appName, versionName: e.versionName, versionCode: e.versionCode },
            params: e
        }, Util.Store.get("TDSDK_initTime") || setTimeout(function () {
            Util.request({
                data: {
                    appProfile: t.appProfiles,
                    deviceProfile: t.deviceProfiles,
                    msgs: [{ type: 1, data: {} }]
                }
            })
        }, 100), this.launchTime = Util.timestamp(), this.appProfile(), this.deviceProfile(), setTimeout(function () {
            t.sessionStart(function () {
                t.sendTmpSession()
            }), setTimeout(function () {
                t.getTmpData()
            }, 1e3)
        }, 300);
        var i = this;
        setTimeout(function () {
            var t = getApp();
            e.autoOnAppShow && !function () {
                var e = t.onShow;
                t.onShow = function () {
                    i.show(), e.call(this, arguments)
                }
            } (), e.autoOnAppHide && !function () {
                var e = t.onHide;
                t.onHide = function () {
                    i.hide(), e.call(this, arguments)
                }
            } ()
        }, 0)
    }, timeout: null, sendTmpSession: function () {
        var e = this;
        this.sessionContinue(), this.timeout && (clearTimeout(this.timeout), this.timeout = null), this.timeout = setTimeout(function () {
            e.sendTmpSession()
        }, 3e4)
    }, getTmpData: function () {
        var e = [], t = wx.getStorageInfoSync().keys;
        t.length && (t = t.filter(function (e) {
            return e.indexOf("TDSDK_PAGE") > -1 || e.indexOf("TDSDK_EVENT") > -1
        })), t.length && t.forEach(function (t) {
            var i = t.split("_")[2];
            e.indexOf(i) < 0 && e.push(i)
        }), e.length && this.sendTmpData(e)
    }, sendTmpData: function (e) {
        var t = this;
        e.length && !function () {
            var i = e[0], n = { status: 3 }, s = "TDSDK_TMP_time_start_" + i, o = "TDSDK_TMP_time_end_" + i;
            n.duration = parseInt((Util.Store.get(o) - Util.Store.get(s)) / 1e3), Object.assign(n, t.session(i)), t.sessionSend(n, function () {
                Util.Store.remove(s), Util.Store.remove(o), e.splice(0, 1), t.sendTmpData(e)
            })
        } ()
    }, isHide2Show: !1, hideTime: 0, show: function () {
        var e = this;
        if (this.isHide2Show) {
            Util.Store.get("TDSDK_TMP_time_end_" + this.session_id) && Util.Store.remove("TDSDK_TMP_time_end_" + this.session_id);
            var t = Util.timestamp();
            t - this.hideTime <= 3e4 ? this.sendTmpSession() : this.sessionFinish(function (t, i) {
                e.session_id = "", e.sessionStart(function (t, i) {
                    e.sendTmpSession()
                })
            })
        }
        this.isHide2Show = !1
    }, hide: function () {
        this.isHide2Show = !0, this.hideTime = Util.timestamp(), Util.Store.set("TDSDK_TMP_time_start_" + this.session_id, Util.Store.get("TDSDK_session_time")), Util.Store.set("TDSDK_TMP_time_end_" + this.session_id, this.hideTime), this.timeout && (clearTimeout(this.timeout), this.timeout = null)
    }, Page: {
        pageUrl: "", pageRefer: "", pageTime: 0, pageTabsList: [], load: function () {
            var e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0], t = this, i = getCurrentPages()[getCurrentPages().length - 1];
            if ("" !== this.pageUrl && (this.pageRefer = this.pageUrl), this.pageUrl = i.__route__, this.pageTime = Util.timestamp(), e) {
                if (this.pageTabsList.indexOf(this.pageUrl) > -1) return !1;
                this.pageTabsList.push(this.pageUrl)
            }
            Config.params.autoOnPageUnload && (e ? !function () {
                var e = i.onHide;
                i.onHide = function () {
                    t.unload(), e.call(this, arguments)
                }
            } () : !function () {
                var e = i.onUnload;
                i.onUnload = function () {
                    t.unload(), e.call(this, arguments)
                }
            } ()), Config.params.autoOnShare && i.onShareAppMessage && !function () {
                var e = i.onShareAppMessage(), n = i.onShareAppMessage;
                i.onShareAppMessage = function () {
                    return t.share(t.pageUrl, e), n.call(this, arguments)
                }
            } (), Config.params.autoOnPullDownRefresh && i.onPullDownRefresh && !function () {
                var e = i.onPullDownRefresh;
                i.onPullDownRefresh = function () {
                    t.pullDownRefresh(this.pageUrl), e.call(this, arguments)
                }
            } (), Config.params.autoOnReachBottom && i.onReachBottom && !function () {
                var e = i.onReachBottom;
                i.onReachBottom = function () {
                    t.onReachBottom(this.pageUrl), e.call(this, arguments)
                }
            } ()
        }, unload: function () {
            var e = {};
            e.name = this.pageUrl, e.start = this.pageTime, e.duration = parseInt((Util.timestamp() - this.pageTime) / 1e3), e.refer = this.pageRefer;
            var t = [];
            t.push(e);
            var i = "TDSDK_PAGE_" + TD.session_id;
            if (Util.Store.get(i)) {
                var n = Util.Store.get(i);
                t = n.concat(t)
            }
            Util.Store.set(i, t)
        }, share: function (e, t) {
            if ("string" != typeof e) {
                t = Object.assign({}, e);
                var i = getCurrentPages()[getCurrentPages().length - 1];
                e = i.__route__
            }
            TD.event({
                id: "WeappShare",
                label: e,
                params: { user: TD.session_id, title: t.title || "", desc: t.desc || "", path: t.path || "" }
            })
        }, pullDownRefresh: function (e) {
            if (!e) {
                var t = getCurrentPages()[getCurrentPages().length - 1];
                e = t.__route__
            }
            TD.event({ id: "WeappPullDownRefresh", label: e })
        }, onReachBottom: function (e) {
            if (!e) {
                var t = getCurrentPages()[getCurrentPages().length - 1];
                e = t.__route__
            }
            TD.event({ id: "WeappReachBottom", label: e })
        }
    }, event: function (e) {
        var t = {};
        if (!("id" in e)) return !1;
        t.id = e.id, t.start = Util.timestamp(), "label" in e && (t.label = e.label), "count" in e ? t.count = e.count : t.count = 1, "params" in e && (t.params = e.params);
        var i = [];
        i.push(t);
        var n = "TDSDK_EVENT_" + this.session_id;
        if (Util.Store.get(n)) {
            var s = Util.Store.get(n);
            i = s.concat(i)
        }
        Util.Store.set(n, i)
    }
};
module.exports = TD;