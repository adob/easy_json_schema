json_validate = (function () {
    
    
    function integer(i) { 
        return (Math.floor(i) === i) ? true : ("not an integer");
    };

    function number(f) { 
        return (typeof f === "number") ? true : ("not a number");
    };

    float = number;

    function string(s) { 
        return (typeof s === "string") ? true : ("not a string");
    };
        
    function mixed() {
        var args = arguments;

        return function(x) 
        {
            var rets = [];
            for (var i = 0; i < args.length; i++)
            {
                var r = validate(x, args[i]);
                if (r === true)
                    return true;
                else
                    rets.push(r);
            }
            
            return rets.join(" and ");
        }
    };
    
    function enumeration() {
        var args = arguments;

        return function(x) 
        {
            var rets = [];
            for (var i = 0; i < args.length; i++)
            {
                var r = args[i];
                if (r === x)
                    return true;
                else
                    rets.push(r);
            }
            
            return "not one of " + rets.join(", ");
        }
    }

    function object() {
        return (typeof s === "object") ? true : ("not an object");
    }

    function optional(type) {
        var f = function(x) {
            if (typeof x === "undefined")
                return true
            else
                return validate(x, type);
        };
        f.type = "optional";
        return f;
    }

    function of(type) {
        var f=function(x) {
            return validate(x, type);
        }
        f.type = "of";
        return f;
    }

    // validate object against schema
    function validate(object, schema)
    {
        
        if (typeof schema === "object")
        {
            if (typeof object !== "object")
                return "not an " + (schema instanceof Array ? "array" : "object");
            
            var error = false;
            var errors = {};
            
            if (schema instanceof Array)
            {
                if (! (object instanceof Array))
                    return "not an array";
                
                if (schema[0].type === "of") {
                    for (var i = 0; i < object.length; i++)
                    {
                        var r = schema[0](object[i]);
                        if (r !== true) {
                            error = true;
                            errors[i] = r;
                        }
                    }
                    if (error)
                        return errors;
                    else
                        return true;
                }
            }
            for (var item in schema) 
            {
                if (schema.hasOwnProperty(item))
                {
                    var constraint = schema[item];
                    var value = object[item];
                    var r = validate(value, constraint);
                    
                    if (r !== true) {
                        error = true;
                        errors[item] = r;
                    }
                }
            }
            
            for (var item in object) {
                if (object.hasOwnProperty(item) && !schema.hasOwnProperty(item)) {
                    error = true;
                    errors[item] = "not allowed here";
                }
            }
        
            
            if (error)
                return errors;
            else
                return true;
        }
        else if (typeof schema === "function")
        {
            if (schema.type !== "optional" && typeof object === "undefined")
                return "missing";
                
            return schema(object);
        }
    }
    
    var ret_fun = function(object, schema)
    {
        var r = validate(object, schema);
        
        if (r === true)
            return null;
        
        return r;
    }
    
    ret_fun.decls =  {
        integer: integer,
        number: number,
        float: float,
        string: string,
        mixed: mixed,
        object: object,
        optional: optional,
        of: of,
        enumeration: enumeration
    }
    
    return ret_fun;
    
})();