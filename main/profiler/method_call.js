/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
(function(global, factory) { /* global define, require, module */

    /* AMD */ if (typeof define === 'function' && define.amd)
        define(["protobufjs/minimal"], factory);

    /* CommonJS */ else if (typeof require === 'function' && typeof module === 'object' && module && module.exports)
        module.exports = factory(require("protobufjs/minimal"));

})(this, function($protobuf) {
    "use strict";

    // Common aliases
    var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
    
    // Exported root namespace
    var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
    
    $root.agent = (function() {
    
        /**
         * Namespace agent.
         * @exports agent
         * @namespace
         */
        var agent = {};
    
        agent.MethodCall = (function() {
    
            /**
             * Properties of a MethodCall.
             * @memberof agent
             * @interface IMethodCall
             * @property {string|null} [signature] MethodCall signature
             * @property {agent.MethodCall.MethodCallType|null} [type] MethodCall type
             * @property {agent.MethodCall.ICallerInfo|null} [caller] MethodCall caller
             * @property {Array.<agent.IMethodCall>|null} [calls] MethodCall calls
             * @property {Array.<agent.MethodCall.IInstruction>|null} [instructions] MethodCall instructions
             * @property {number|Long|null} [duration] MethodCall duration
             * @property {number|Long|null} [newThreadId] MethodCall newThreadId
             * @property {number|null} [depth] MethodCall depth
             * @property {Array.<string>|null} [paramValues] MethodCall paramValues
             * @property {string|null} [returnValue] MethodCall returnValue
             */
    
            /**
             * Constructs a new MethodCall.
             * @memberof agent
             * @classdesc Represents a MethodCall.
             * @implements IMethodCall
             * @constructor
             * @param {agent.IMethodCall=} [properties] Properties to set
             */
            function MethodCall(properties) {
                this.calls = [];
                this.instructions = [];
                this.paramValues = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * MethodCall signature.
             * @member {string} signature
             * @memberof agent.MethodCall
             * @instance
             */
            MethodCall.prototype.signature = "";
    
            /**
             * MethodCall type.
             * @member {agent.MethodCall.MethodCallType} type
             * @memberof agent.MethodCall
             * @instance
             */
            MethodCall.prototype.type = 0;
    
            /**
             * MethodCall caller.
             * @member {agent.MethodCall.ICallerInfo|null|undefined} caller
             * @memberof agent.MethodCall
             * @instance
             */
            MethodCall.prototype.caller = null;
    
            /**
             * MethodCall calls.
             * @member {Array.<agent.IMethodCall>} calls
             * @memberof agent.MethodCall
             * @instance
             */
            MethodCall.prototype.calls = $util.emptyArray;
    
            /**
             * MethodCall instructions.
             * @member {Array.<agent.MethodCall.IInstruction>} instructions
             * @memberof agent.MethodCall
             * @instance
             */
            MethodCall.prototype.instructions = $util.emptyArray;
    
            /**
             * MethodCall duration.
             * @member {number|Long} duration
             * @memberof agent.MethodCall
             * @instance
             */
            MethodCall.prototype.duration = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
    
            /**
             * MethodCall newThreadId.
             * @member {number|Long} newThreadId
             * @memberof agent.MethodCall
             * @instance
             */
            MethodCall.prototype.newThreadId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
    
            /**
             * MethodCall depth.
             * @member {number} depth
             * @memberof agent.MethodCall
             * @instance
             */
            MethodCall.prototype.depth = 0;
    
            /**
             * MethodCall paramValues.
             * @member {Array.<string>} paramValues
             * @memberof agent.MethodCall
             * @instance
             */
            MethodCall.prototype.paramValues = $util.emptyArray;
    
            /**
             * MethodCall returnValue.
             * @member {string} returnValue
             * @memberof agent.MethodCall
             * @instance
             */
            MethodCall.prototype.returnValue = "";
    
            /**
             * Creates a new MethodCall instance using the specified properties.
             * @function create
             * @memberof agent.MethodCall
             * @static
             * @param {agent.IMethodCall=} [properties] Properties to set
             * @returns {agent.MethodCall} MethodCall instance
             */
            MethodCall.create = function create(properties) {
                return new MethodCall(properties);
            };
    
            /**
             * Encodes the specified MethodCall message. Does not implicitly {@link agent.MethodCall.verify|verify} messages.
             * @function encode
             * @memberof agent.MethodCall
             * @static
             * @param {agent.IMethodCall} message MethodCall message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MethodCall.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.signature != null && message.hasOwnProperty("signature"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.signature);
                if (message.type != null && message.hasOwnProperty("type"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.type);
                if (message.caller != null && message.hasOwnProperty("caller"))
                    $root.agent.MethodCall.CallerInfo.encode(message.caller, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.calls != null && message.calls.length)
                    for (var i = 0; i < message.calls.length; ++i)
                        $root.agent.MethodCall.encode(message.calls[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.instructions != null && message.instructions.length)
                    for (var i = 0; i < message.instructions.length; ++i)
                        $root.agent.MethodCall.Instruction.encode(message.instructions[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.duration != null && message.hasOwnProperty("duration"))
                    writer.uint32(/* id 6, wireType 0 =*/48).int64(message.duration);
                if (message.newThreadId != null && message.hasOwnProperty("newThreadId"))
                    writer.uint32(/* id 7, wireType 0 =*/56).int64(message.newThreadId);
                if (message.depth != null && message.hasOwnProperty("depth"))
                    writer.uint32(/* id 8, wireType 0 =*/64).int32(message.depth);
                if (message.paramValues != null && message.paramValues.length)
                    for (var i = 0; i < message.paramValues.length; ++i)
                        writer.uint32(/* id 9, wireType 2 =*/74).string(message.paramValues[i]);
                if (message.returnValue != null && message.hasOwnProperty("returnValue"))
                    writer.uint32(/* id 10, wireType 2 =*/82).string(message.returnValue);
                return writer;
            };
    
            /**
             * Encodes the specified MethodCall message, length delimited. Does not implicitly {@link agent.MethodCall.verify|verify} messages.
             * @function encodeDelimited
             * @memberof agent.MethodCall
             * @static
             * @param {agent.IMethodCall} message MethodCall message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MethodCall.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a MethodCall message from the specified reader or buffer.
             * @function decode
             * @memberof agent.MethodCall
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {agent.MethodCall} MethodCall
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MethodCall.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.agent.MethodCall();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.signature = reader.string();
                        break;
                    case 2:
                        message.type = reader.int32();
                        break;
                    case 3:
                        message.caller = $root.agent.MethodCall.CallerInfo.decode(reader, reader.uint32());
                        break;
                    case 4:
                        if (!(message.calls && message.calls.length))
                            message.calls = [];
                        message.calls.push($root.agent.MethodCall.decode(reader, reader.uint32()));
                        break;
                    case 5:
                        if (!(message.instructions && message.instructions.length))
                            message.instructions = [];
                        message.instructions.push($root.agent.MethodCall.Instruction.decode(reader, reader.uint32()));
                        break;
                    case 6:
                        message.duration = reader.int64();
                        break;
                    case 7:
                        message.newThreadId = reader.int64();
                        break;
                    case 8:
                        message.depth = reader.int32();
                        break;
                    case 9:
                        if (!(message.paramValues && message.paramValues.length))
                            message.paramValues = [];
                        message.paramValues.push(reader.string());
                        break;
                    case 10:
                        message.returnValue = reader.string();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a MethodCall message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof agent.MethodCall
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {agent.MethodCall} MethodCall
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MethodCall.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a MethodCall message.
             * @function verify
             * @memberof agent.MethodCall
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            MethodCall.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.signature != null && message.hasOwnProperty("signature"))
                    if (!$util.isString(message.signature))
                        return "signature: string expected";
                if (message.type != null && message.hasOwnProperty("type"))
                    switch (message.type) {
                    default:
                        return "type: enum value expected";
                    case 0:
                    case 1:
                        break;
                    }
                if (message.caller != null && message.hasOwnProperty("caller")) {
                    var error = $root.agent.MethodCall.CallerInfo.verify(message.caller);
                    if (error)
                        return "caller." + error;
                }
                if (message.calls != null && message.hasOwnProperty("calls")) {
                    if (!Array.isArray(message.calls))
                        return "calls: array expected";
                    for (var i = 0; i < message.calls.length; ++i) {
                        var error = $root.agent.MethodCall.verify(message.calls[i]);
                        if (error)
                            return "calls." + error;
                    }
                }
                if (message.instructions != null && message.hasOwnProperty("instructions")) {
                    if (!Array.isArray(message.instructions))
                        return "instructions: array expected";
                    for (var i = 0; i < message.instructions.length; ++i) {
                        var error = $root.agent.MethodCall.Instruction.verify(message.instructions[i]);
                        if (error)
                            return "instructions." + error;
                    }
                }
                if (message.duration != null && message.hasOwnProperty("duration"))
                    if (!$util.isInteger(message.duration) && !(message.duration && $util.isInteger(message.duration.low) && $util.isInteger(message.duration.high)))
                        return "duration: integer|Long expected";
                if (message.newThreadId != null && message.hasOwnProperty("newThreadId"))
                    if (!$util.isInteger(message.newThreadId) && !(message.newThreadId && $util.isInteger(message.newThreadId.low) && $util.isInteger(message.newThreadId.high)))
                        return "newThreadId: integer|Long expected";
                if (message.depth != null && message.hasOwnProperty("depth"))
                    if (!$util.isInteger(message.depth))
                        return "depth: integer expected";
                if (message.paramValues != null && message.hasOwnProperty("paramValues")) {
                    if (!Array.isArray(message.paramValues))
                        return "paramValues: array expected";
                    for (var i = 0; i < message.paramValues.length; ++i)
                        if (!$util.isString(message.paramValues[i]))
                            return "paramValues: string[] expected";
                }
                if (message.returnValue != null && message.hasOwnProperty("returnValue"))
                    if (!$util.isString(message.returnValue))
                        return "returnValue: string expected";
                return null;
            };
    
            /**
             * Creates a MethodCall message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof agent.MethodCall
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {agent.MethodCall} MethodCall
             */
            MethodCall.fromObject = function fromObject(object) {
                if (object instanceof $root.agent.MethodCall)
                    return object;
                var message = new $root.agent.MethodCall();
                if (object.signature != null)
                    message.signature = String(object.signature);
                switch (object.type) {
                case "NORMAL":
                case 0:
                    message.type = 0;
                    break;
                case "THREAD_START":
                case 1:
                    message.type = 1;
                    break;
                }
                if (object.caller != null) {
                    if (typeof object.caller !== "object")
                        throw TypeError(".agent.MethodCall.caller: object expected");
                    message.caller = $root.agent.MethodCall.CallerInfo.fromObject(object.caller);
                }
                if (object.calls) {
                    if (!Array.isArray(object.calls))
                        throw TypeError(".agent.MethodCall.calls: array expected");
                    message.calls = [];
                    for (var i = 0; i < object.calls.length; ++i) {
                        if (typeof object.calls[i] !== "object")
                            throw TypeError(".agent.MethodCall.calls: object expected");
                        message.calls[i] = $root.agent.MethodCall.fromObject(object.calls[i]);
                    }
                }
                if (object.instructions) {
                    if (!Array.isArray(object.instructions))
                        throw TypeError(".agent.MethodCall.instructions: array expected");
                    message.instructions = [];
                    for (var i = 0; i < object.instructions.length; ++i) {
                        if (typeof object.instructions[i] !== "object")
                            throw TypeError(".agent.MethodCall.instructions: object expected");
                        message.instructions[i] = $root.agent.MethodCall.Instruction.fromObject(object.instructions[i]);
                    }
                }
                if (object.duration != null)
                    if ($util.Long)
                        (message.duration = $util.Long.fromValue(object.duration)).unsigned = false;
                    else if (typeof object.duration === "string")
                        message.duration = parseInt(object.duration, 10);
                    else if (typeof object.duration === "number")
                        message.duration = object.duration;
                    else if (typeof object.duration === "object")
                        message.duration = new $util.LongBits(object.duration.low >>> 0, object.duration.high >>> 0).toNumber();
                if (object.newThreadId != null)
                    if ($util.Long)
                        (message.newThreadId = $util.Long.fromValue(object.newThreadId)).unsigned = false;
                    else if (typeof object.newThreadId === "string")
                        message.newThreadId = parseInt(object.newThreadId, 10);
                    else if (typeof object.newThreadId === "number")
                        message.newThreadId = object.newThreadId;
                    else if (typeof object.newThreadId === "object")
                        message.newThreadId = new $util.LongBits(object.newThreadId.low >>> 0, object.newThreadId.high >>> 0).toNumber();
                if (object.depth != null)
                    message.depth = object.depth | 0;
                if (object.paramValues) {
                    if (!Array.isArray(object.paramValues))
                        throw TypeError(".agent.MethodCall.paramValues: array expected");
                    message.paramValues = [];
                    for (var i = 0; i < object.paramValues.length; ++i)
                        message.paramValues[i] = String(object.paramValues[i]);
                }
                if (object.returnValue != null)
                    message.returnValue = String(object.returnValue);
                return message;
            };
    
            /**
             * Creates a plain object from a MethodCall message. Also converts values to other types if specified.
             * @function toObject
             * @memberof agent.MethodCall
             * @static
             * @param {agent.MethodCall} message MethodCall
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            MethodCall.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults) {
                    object.calls = [];
                    object.instructions = [];
                    object.paramValues = [];
                }
                if (options.defaults) {
                    object.signature = "";
                    object.type = options.enums === String ? "NORMAL" : 0;
                    object.caller = null;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.duration = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.duration = options.longs === String ? "0" : 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.newThreadId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.newThreadId = options.longs === String ? "0" : 0;
                    object.depth = 0;
                    object.returnValue = "";
                }
                if (message.signature != null && message.hasOwnProperty("signature"))
                    object.signature = message.signature;
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.agent.MethodCall.MethodCallType[message.type] : message.type;
                if (message.caller != null && message.hasOwnProperty("caller"))
                    object.caller = $root.agent.MethodCall.CallerInfo.toObject(message.caller, options);
                if (message.calls && message.calls.length) {
                    object.calls = [];
                    for (var j = 0; j < message.calls.length; ++j)
                        object.calls[j] = $root.agent.MethodCall.toObject(message.calls[j], options);
                }
                if (message.instructions && message.instructions.length) {
                    object.instructions = [];
                    for (var j = 0; j < message.instructions.length; ++j)
                        object.instructions[j] = $root.agent.MethodCall.Instruction.toObject(message.instructions[j], options);
                }
                if (message.duration != null && message.hasOwnProperty("duration"))
                    if (typeof message.duration === "number")
                        object.duration = options.longs === String ? String(message.duration) : message.duration;
                    else
                        object.duration = options.longs === String ? $util.Long.prototype.toString.call(message.duration) : options.longs === Number ? new $util.LongBits(message.duration.low >>> 0, message.duration.high >>> 0).toNumber() : message.duration;
                if (message.newThreadId != null && message.hasOwnProperty("newThreadId"))
                    if (typeof message.newThreadId === "number")
                        object.newThreadId = options.longs === String ? String(message.newThreadId) : message.newThreadId;
                    else
                        object.newThreadId = options.longs === String ? $util.Long.prototype.toString.call(message.newThreadId) : options.longs === Number ? new $util.LongBits(message.newThreadId.low >>> 0, message.newThreadId.high >>> 0).toNumber() : message.newThreadId;
                if (message.depth != null && message.hasOwnProperty("depth"))
                    object.depth = message.depth;
                if (message.paramValues && message.paramValues.length) {
                    object.paramValues = [];
                    for (var j = 0; j < message.paramValues.length; ++j)
                        object.paramValues[j] = message.paramValues[j];
                }
                if (message.returnValue != null && message.hasOwnProperty("returnValue"))
                    object.returnValue = message.returnValue;
                return object;
            };
    
            /**
             * Converts this MethodCall to JSON.
             * @function toJSON
             * @memberof agent.MethodCall
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            MethodCall.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * MethodCallType enum.
             * @name agent.MethodCall.MethodCallType
             * @enum {string}
             * @property {number} NORMAL=0 NORMAL value
             * @property {number} THREAD_START=1 THREAD_START value
             */
            MethodCall.MethodCallType = (function() {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "NORMAL"] = 0;
                values[valuesById[1] = "THREAD_START"] = 1;
                return values;
            })();
    
            MethodCall.CallerInfo = (function() {
    
                /**
                 * Properties of a CallerInfo.
                 * @memberof agent.MethodCall
                 * @interface ICallerInfo
                 * @property {string|null} [filename] CallerInfo filename
                 * @property {number|null} [linenum] CallerInfo linenum
                 */
    
                /**
                 * Constructs a new CallerInfo.
                 * @memberof agent.MethodCall
                 * @classdesc Represents a CallerInfo.
                 * @implements ICallerInfo
                 * @constructor
                 * @param {agent.MethodCall.ICallerInfo=} [properties] Properties to set
                 */
                function CallerInfo(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }
    
                /**
                 * CallerInfo filename.
                 * @member {string} filename
                 * @memberof agent.MethodCall.CallerInfo
                 * @instance
                 */
                CallerInfo.prototype.filename = "";
    
                /**
                 * CallerInfo linenum.
                 * @member {number} linenum
                 * @memberof agent.MethodCall.CallerInfo
                 * @instance
                 */
                CallerInfo.prototype.linenum = 0;
    
                /**
                 * Creates a new CallerInfo instance using the specified properties.
                 * @function create
                 * @memberof agent.MethodCall.CallerInfo
                 * @static
                 * @param {agent.MethodCall.ICallerInfo=} [properties] Properties to set
                 * @returns {agent.MethodCall.CallerInfo} CallerInfo instance
                 */
                CallerInfo.create = function create(properties) {
                    return new CallerInfo(properties);
                };
    
                /**
                 * Encodes the specified CallerInfo message. Does not implicitly {@link agent.MethodCall.CallerInfo.verify|verify} messages.
                 * @function encode
                 * @memberof agent.MethodCall.CallerInfo
                 * @static
                 * @param {agent.MethodCall.ICallerInfo} message CallerInfo message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                CallerInfo.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.filename != null && message.hasOwnProperty("filename"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.filename);
                    if (message.linenum != null && message.hasOwnProperty("linenum"))
                        writer.uint32(/* id 2, wireType 0 =*/16).int32(message.linenum);
                    return writer;
                };
    
                /**
                 * Encodes the specified CallerInfo message, length delimited. Does not implicitly {@link agent.MethodCall.CallerInfo.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof agent.MethodCall.CallerInfo
                 * @static
                 * @param {agent.MethodCall.ICallerInfo} message CallerInfo message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                CallerInfo.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };
    
                /**
                 * Decodes a CallerInfo message from the specified reader or buffer.
                 * @function decode
                 * @memberof agent.MethodCall.CallerInfo
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {agent.MethodCall.CallerInfo} CallerInfo
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                CallerInfo.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.agent.MethodCall.CallerInfo();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.filename = reader.string();
                            break;
                        case 2:
                            message.linenum = reader.int32();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };
    
                /**
                 * Decodes a CallerInfo message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof agent.MethodCall.CallerInfo
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {agent.MethodCall.CallerInfo} CallerInfo
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                CallerInfo.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };
    
                /**
                 * Verifies a CallerInfo message.
                 * @function verify
                 * @memberof agent.MethodCall.CallerInfo
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                CallerInfo.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.filename != null && message.hasOwnProperty("filename"))
                        if (!$util.isString(message.filename))
                            return "filename: string expected";
                    if (message.linenum != null && message.hasOwnProperty("linenum"))
                        if (!$util.isInteger(message.linenum))
                            return "linenum: integer expected";
                    return null;
                };
    
                /**
                 * Creates a CallerInfo message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof agent.MethodCall.CallerInfo
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {agent.MethodCall.CallerInfo} CallerInfo
                 */
                CallerInfo.fromObject = function fromObject(object) {
                    if (object instanceof $root.agent.MethodCall.CallerInfo)
                        return object;
                    var message = new $root.agent.MethodCall.CallerInfo();
                    if (object.filename != null)
                        message.filename = String(object.filename);
                    if (object.linenum != null)
                        message.linenum = object.linenum | 0;
                    return message;
                };
    
                /**
                 * Creates a plain object from a CallerInfo message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof agent.MethodCall.CallerInfo
                 * @static
                 * @param {agent.MethodCall.CallerInfo} message CallerInfo
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                CallerInfo.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.filename = "";
                        object.linenum = 0;
                    }
                    if (message.filename != null && message.hasOwnProperty("filename"))
                        object.filename = message.filename;
                    if (message.linenum != null && message.hasOwnProperty("linenum"))
                        object.linenum = message.linenum;
                    return object;
                };
    
                /**
                 * Converts this CallerInfo to JSON.
                 * @function toJSON
                 * @memberof agent.MethodCall.CallerInfo
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                CallerInfo.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };
    
                return CallerInfo;
            })();
    
            /**
             * InstructionType enum.
             * @name agent.MethodCall.InstructionType
             * @enum {string}
             * @property {number} READ=0 READ value
             * @property {number} WRITE=1 WRITE value
             * @property {number} METHOD_CALL=2 METHOD_CALL value
             */
            MethodCall.InstructionType = (function() {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "READ"] = 0;
                values[valuesById[1] = "WRITE"] = 1;
                values[valuesById[2] = "METHOD_CALL"] = 2;
                return values;
            })();
    
            MethodCall.Instruction = (function() {
    
                /**
                 * Properties of an Instruction.
                 * @memberof agent.MethodCall
                 * @interface IInstruction
                 * @property {agent.MethodCall.InstructionType|null} [type] Instruction type
                 * @property {agent.MethodCall.Instruction.IVariable|null} [variable] Instruction variable
                 * @property {string|null} [value] Instruction value
                 * @property {number|null} [linenum] Instruction linenum
                 * @property {string|null} [callSignature] Instruction callSignature
                 */
    
                /**
                 * Constructs a new Instruction.
                 * @memberof agent.MethodCall
                 * @classdesc Represents an Instruction.
                 * @implements IInstruction
                 * @constructor
                 * @param {agent.MethodCall.IInstruction=} [properties] Properties to set
                 */
                function Instruction(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }
    
                /**
                 * Instruction type.
                 * @member {agent.MethodCall.InstructionType} type
                 * @memberof agent.MethodCall.Instruction
                 * @instance
                 */
                Instruction.prototype.type = 0;
    
                /**
                 * Instruction variable.
                 * @member {agent.MethodCall.Instruction.IVariable|null|undefined} variable
                 * @memberof agent.MethodCall.Instruction
                 * @instance
                 */
                Instruction.prototype.variable = null;
    
                /**
                 * Instruction value.
                 * @member {string} value
                 * @memberof agent.MethodCall.Instruction
                 * @instance
                 */
                Instruction.prototype.value = "";
    
                /**
                 * Instruction linenum.
                 * @member {number} linenum
                 * @memberof agent.MethodCall.Instruction
                 * @instance
                 */
                Instruction.prototype.linenum = 0;
    
                /**
                 * Instruction callSignature.
                 * @member {string} callSignature
                 * @memberof agent.MethodCall.Instruction
                 * @instance
                 */
                Instruction.prototype.callSignature = "";
    
                /**
                 * Creates a new Instruction instance using the specified properties.
                 * @function create
                 * @memberof agent.MethodCall.Instruction
                 * @static
                 * @param {agent.MethodCall.IInstruction=} [properties] Properties to set
                 * @returns {agent.MethodCall.Instruction} Instruction instance
                 */
                Instruction.create = function create(properties) {
                    return new Instruction(properties);
                };
    
                /**
                 * Encodes the specified Instruction message. Does not implicitly {@link agent.MethodCall.Instruction.verify|verify} messages.
                 * @function encode
                 * @memberof agent.MethodCall.Instruction
                 * @static
                 * @param {agent.MethodCall.IInstruction} message Instruction message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Instruction.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.type != null && message.hasOwnProperty("type"))
                        writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
                    if (message.variable != null && message.hasOwnProperty("variable"))
                        $root.agent.MethodCall.Instruction.Variable.encode(message.variable, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    if (message.value != null && message.hasOwnProperty("value"))
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.value);
                    if (message.linenum != null && message.hasOwnProperty("linenum"))
                        writer.uint32(/* id 4, wireType 0 =*/32).int32(message.linenum);
                    if (message.callSignature != null && message.hasOwnProperty("callSignature"))
                        writer.uint32(/* id 5, wireType 2 =*/42).string(message.callSignature);
                    return writer;
                };
    
                /**
                 * Encodes the specified Instruction message, length delimited. Does not implicitly {@link agent.MethodCall.Instruction.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof agent.MethodCall.Instruction
                 * @static
                 * @param {agent.MethodCall.IInstruction} message Instruction message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Instruction.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };
    
                /**
                 * Decodes an Instruction message from the specified reader or buffer.
                 * @function decode
                 * @memberof agent.MethodCall.Instruction
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {agent.MethodCall.Instruction} Instruction
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Instruction.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.agent.MethodCall.Instruction();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.type = reader.int32();
                            break;
                        case 2:
                            message.variable = $root.agent.MethodCall.Instruction.Variable.decode(reader, reader.uint32());
                            break;
                        case 3:
                            message.value = reader.string();
                            break;
                        case 4:
                            message.linenum = reader.int32();
                            break;
                        case 5:
                            message.callSignature = reader.string();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };
    
                /**
                 * Decodes an Instruction message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof agent.MethodCall.Instruction
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {agent.MethodCall.Instruction} Instruction
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Instruction.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };
    
                /**
                 * Verifies an Instruction message.
                 * @function verify
                 * @memberof agent.MethodCall.Instruction
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Instruction.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.type != null && message.hasOwnProperty("type"))
                        switch (message.type) {
                        default:
                            return "type: enum value expected";
                        case 0:
                        case 1:
                        case 2:
                            break;
                        }
                    if (message.variable != null && message.hasOwnProperty("variable")) {
                        var error = $root.agent.MethodCall.Instruction.Variable.verify(message.variable);
                        if (error)
                            return "variable." + error;
                    }
                    if (message.value != null && message.hasOwnProperty("value"))
                        if (!$util.isString(message.value))
                            return "value: string expected";
                    if (message.linenum != null && message.hasOwnProperty("linenum"))
                        if (!$util.isInteger(message.linenum))
                            return "linenum: integer expected";
                    if (message.callSignature != null && message.hasOwnProperty("callSignature"))
                        if (!$util.isString(message.callSignature))
                            return "callSignature: string expected";
                    return null;
                };
    
                /**
                 * Creates an Instruction message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof agent.MethodCall.Instruction
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {agent.MethodCall.Instruction} Instruction
                 */
                Instruction.fromObject = function fromObject(object) {
                    if (object instanceof $root.agent.MethodCall.Instruction)
                        return object;
                    var message = new $root.agent.MethodCall.Instruction();
                    switch (object.type) {
                    case "READ":
                    case 0:
                        message.type = 0;
                        break;
                    case "WRITE":
                    case 1:
                        message.type = 1;
                        break;
                    case "METHOD_CALL":
                    case 2:
                        message.type = 2;
                        break;
                    }
                    if (object.variable != null) {
                        if (typeof object.variable !== "object")
                            throw TypeError(".agent.MethodCall.Instruction.variable: object expected");
                        message.variable = $root.agent.MethodCall.Instruction.Variable.fromObject(object.variable);
                    }
                    if (object.value != null)
                        message.value = String(object.value);
                    if (object.linenum != null)
                        message.linenum = object.linenum | 0;
                    if (object.callSignature != null)
                        message.callSignature = String(object.callSignature);
                    return message;
                };
    
                /**
                 * Creates a plain object from an Instruction message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof agent.MethodCall.Instruction
                 * @static
                 * @param {agent.MethodCall.Instruction} message Instruction
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Instruction.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.type = options.enums === String ? "READ" : 0;
                        object.variable = null;
                        object.value = "";
                        object.linenum = 0;
                        object.callSignature = "";
                    }
                    if (message.type != null && message.hasOwnProperty("type"))
                        object.type = options.enums === String ? $root.agent.MethodCall.InstructionType[message.type] : message.type;
                    if (message.variable != null && message.hasOwnProperty("variable"))
                        object.variable = $root.agent.MethodCall.Instruction.Variable.toObject(message.variable, options);
                    if (message.value != null && message.hasOwnProperty("value"))
                        object.value = message.value;
                    if (message.linenum != null && message.hasOwnProperty("linenum"))
                        object.linenum = message.linenum;
                    if (message.callSignature != null && message.hasOwnProperty("callSignature"))
                        object.callSignature = message.callSignature;
                    return object;
                };
    
                /**
                 * Converts this Instruction to JSON.
                 * @function toJSON
                 * @memberof agent.MethodCall.Instruction
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Instruction.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };
    
                Instruction.Variable = (function() {
    
                    /**
                     * Properties of a Variable.
                     * @memberof agent.MethodCall.Instruction
                     * @interface IVariable
                     * @property {number|null} [index] Variable index
                     * @property {string|null} [name] Variable name
                     * @property {string|null} [type] Variable type
                     */
    
                    /**
                     * Constructs a new Variable.
                     * @memberof agent.MethodCall.Instruction
                     * @classdesc Represents a Variable.
                     * @implements IVariable
                     * @constructor
                     * @param {agent.MethodCall.Instruction.IVariable=} [properties] Properties to set
                     */
                    function Variable(properties) {
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }
    
                    /**
                     * Variable index.
                     * @member {number} index
                     * @memberof agent.MethodCall.Instruction.Variable
                     * @instance
                     */
                    Variable.prototype.index = 0;
    
                    /**
                     * Variable name.
                     * @member {string} name
                     * @memberof agent.MethodCall.Instruction.Variable
                     * @instance
                     */
                    Variable.prototype.name = "";
    
                    /**
                     * Variable type.
                     * @member {string} type
                     * @memberof agent.MethodCall.Instruction.Variable
                     * @instance
                     */
                    Variable.prototype.type = "";
    
                    /**
                     * Creates a new Variable instance using the specified properties.
                     * @function create
                     * @memberof agent.MethodCall.Instruction.Variable
                     * @static
                     * @param {agent.MethodCall.Instruction.IVariable=} [properties] Properties to set
                     * @returns {agent.MethodCall.Instruction.Variable} Variable instance
                     */
                    Variable.create = function create(properties) {
                        return new Variable(properties);
                    };
    
                    /**
                     * Encodes the specified Variable message. Does not implicitly {@link agent.MethodCall.Instruction.Variable.verify|verify} messages.
                     * @function encode
                     * @memberof agent.MethodCall.Instruction.Variable
                     * @static
                     * @param {agent.MethodCall.Instruction.IVariable} message Variable message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Variable.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.index != null && message.hasOwnProperty("index"))
                            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.index);
                        if (message.name != null && message.hasOwnProperty("name"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                        if (message.type != null && message.hasOwnProperty("type"))
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.type);
                        return writer;
                    };
    
                    /**
                     * Encodes the specified Variable message, length delimited. Does not implicitly {@link agent.MethodCall.Instruction.Variable.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof agent.MethodCall.Instruction.Variable
                     * @static
                     * @param {agent.MethodCall.Instruction.IVariable} message Variable message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Variable.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };
    
                    /**
                     * Decodes a Variable message from the specified reader or buffer.
                     * @function decode
                     * @memberof agent.MethodCall.Instruction.Variable
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {agent.MethodCall.Instruction.Variable} Variable
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Variable.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.agent.MethodCall.Instruction.Variable();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1:
                                message.index = reader.int32();
                                break;
                            case 2:
                                message.name = reader.string();
                                break;
                            case 3:
                                message.type = reader.string();
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };
    
                    /**
                     * Decodes a Variable message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof agent.MethodCall.Instruction.Variable
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {agent.MethodCall.Instruction.Variable} Variable
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Variable.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };
    
                    /**
                     * Verifies a Variable message.
                     * @function verify
                     * @memberof agent.MethodCall.Instruction.Variable
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Variable.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.index != null && message.hasOwnProperty("index"))
                            if (!$util.isInteger(message.index))
                                return "index: integer expected";
                        if (message.name != null && message.hasOwnProperty("name"))
                            if (!$util.isString(message.name))
                                return "name: string expected";
                        if (message.type != null && message.hasOwnProperty("type"))
                            if (!$util.isString(message.type))
                                return "type: string expected";
                        return null;
                    };
    
                    /**
                     * Creates a Variable message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof agent.MethodCall.Instruction.Variable
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {agent.MethodCall.Instruction.Variable} Variable
                     */
                    Variable.fromObject = function fromObject(object) {
                        if (object instanceof $root.agent.MethodCall.Instruction.Variable)
                            return object;
                        var message = new $root.agent.MethodCall.Instruction.Variable();
                        if (object.index != null)
                            message.index = object.index | 0;
                        if (object.name != null)
                            message.name = String(object.name);
                        if (object.type != null)
                            message.type = String(object.type);
                        return message;
                    };
    
                    /**
                     * Creates a plain object from a Variable message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof agent.MethodCall.Instruction.Variable
                     * @static
                     * @param {agent.MethodCall.Instruction.Variable} message Variable
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Variable.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (options.defaults) {
                            object.index = 0;
                            object.name = "";
                            object.type = "";
                        }
                        if (message.index != null && message.hasOwnProperty("index"))
                            object.index = message.index;
                        if (message.name != null && message.hasOwnProperty("name"))
                            object.name = message.name;
                        if (message.type != null && message.hasOwnProperty("type"))
                            object.type = message.type;
                        return object;
                    };
    
                    /**
                     * Converts this Variable to JSON.
                     * @function toJSON
                     * @memberof agent.MethodCall.Instruction.Variable
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Variable.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };
    
                    return Variable;
                })();
    
                return Instruction;
            })();
    
            return MethodCall;
        })();
    
        return agent;
    })();

    return $root;
});
