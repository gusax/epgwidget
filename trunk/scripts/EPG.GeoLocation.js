/*global EPG*/

EPG.GeoLocation = (function ()
{
  var obj = {},
  Debug,
  FileLoader,
  GEOLOCATION_URL = "http://ipinfodb.com/ip_query.php?output=json",
  listeners = [],
  CACHE_TIME = 15 * 60 * 1000,
  lastPosition,
  maxCacheAge = 2,
  allowed = false,
  firstTime = 2;
  
  function emptyFunction() {}
  
  function setNeed(name, id)
  {
    var need = {};
    need.id = id;
    obj.needs[name] = need;
  }
  
  function setImplementation(name, id)
  {
    var impl = {};
    impl.id = id;
    impl.provides = {};
    obj.implementing[name] = impl;
  }
  
  obj.id = "se.bizo.GeoLocation";
  obj.implementing = {};
  obj.provides = {};
  obj.needs = {};
  
  setNeed("DebugIF", "org.noIp.ghettot.jsframework.interface.singleton.DebugIF");
  setNeed("FileLoaderIF", "org.noIp.ghettot.jsframework.interface.singleton.FileLoaderIF");
  
  setImplementation("LoadIF", "org.noIp.ghettot.jsframework.interface.LoadIF");

  function sendOnPositionChangeEvent(position)
  {
    Debug.inform("GeoLocation sendOnPositionChangeEvent");
    var i;
    for (i = 0; i < listeners.length; i += 1)
    {
      listeners[i](position);
    }
  }

  function gotPosition(position, onSuccess, onFailure)
  {
    try
    {
      Debug.inform("GetLocation gotPosition firstTime " + firstTime);
      if (firstTime < 2)
      {
        firstTime += 1;
        position = {
          "Ip" : "0.0.0.0",
          "Status" : "OK",
          "CountryCode" : "UZ",
          "CountryName" : "Uzbekistan",
          "RegionCode" : "16",
          "RegionName" : "Ostergotlands Lan",
          "City" : "Taschkent",
          "ZipPostalCode" : "",
          "Latitude" : "1.1234",
          "Longitude" : "1.1234",
          "Timezone" : "1",
          "Gmtoffset" : "1",
          "Dstoffset" : "2"
        };
      }
      if (position && position.Latitude && position.Longitude && position.City)
      {
        var prevPosition = lastPosition;
        lastPosition = position;
        maxCacheAge = new Date().getTime() + CACHE_TIME;
        onSuccess(position);
        if (!prevPosition || (prevPosition && prevPosition.Longitude !== position.Longitude && prevPosition.Latitude !== position.Latitude))
        {
          sendOnPositionChangeEvent(position);
        }
      }
      else if (onFailure)
      {
        onFailure();
      }
    }
    catch (error)
    {
      Debug.alert(obj.id + " gotPosition " + error);
    }
  }
  
  function sendCachedResponse(onSuccess, onFailure)
  {
    try
    {
      if (lastPosition)
      {
        setTimeout(function ()
        {
          gotPosition(lastPosition, onSuccess, onFailure);
        }, 1);
      }
      else if (onFailure)
      {
        onFailure();
      }
    }
    catch (error)
    {
      Debug.alert(obj.id + " sendCachedResponse " + error);
    }
  }
  
  obj.provides.getLocation = function (onSuccess, onFailure)
  {
    try
    {
      var now = new Date().getTime();
      if (!allowed)
      {
        setTimeout(onFailure, 1);
      }
      else if (now > maxCacheAge)
      {
        FileLoader.open(GEOLOCATION_URL,
            function (data)
            {
              gotPosition(data, onSuccess, onFailure);
            },
            function ()
            {
              sendCachedResponse(onSuccess, onFailure);
            },
            false,
            false,
            true);
      }
      else
      { // Send cached response
        sendCachedResponse(onSuccess, onFailure);
      }
    }
    catch (error)
    {
      Debug.alert(obj.id + " provides.getLocation " + error);
    }
  };
  
  obj.provides.setOkToFetchLocation = function(ok)
  {
    allowed = ok;
  };
  
  obj.provides.addEventListener = function (callback)
  {
    listeners.push(callback);
  };
  
  obj.provides.removeEventListener = function (callback)
  {
    var i;
    for (i = 0; i < listeners.length; i += 1)
    {
      if (listeners[i] === callback)
      {
        listeners[i].slice(i, 1);
      }
    }
  };
  
  obj.implementing.LoadIF.provides.onLoad = function (D, F)
  {
    try
    {
      Debug = obj.needs.DebugIF.provides;
      FileLoader = obj.needs.FileLoaderIF.provides;
      if (D && F)
      {
        Debug = D;
        FileLoader = F;
      }
      obj.provides.getLocation(emptyFunction, emptyFunction);
    }
    catch (error)
    {
      alert(obj.id + " provides.onLoad " + error);
    }
  };
  
  obj.implementing.LoadIF.provides.onUnload = emptyFunction;
  
  return obj;
}());
EPG.GeoLocation.implementing.LoadIF.provides.onLoad(EPG.debug, EPG.file);
EPG.GeoLocation = EPG.GeoLocation.provides;
//EPG.PreLoader.resume();