/*jslint adsafe:false, bitwise: true, browser:true, cap:false, Debug:false, eqeqeq: true, evil: false, fragment:false, laxbreak:false, nomen:true, passfail:false, plusplus:true, rhino:false, undef:true, white:false, widget:false */

/*extern EPG, widget*/
if (EPG.debug)
{
  EPG.debug.inform("EPG.Filmtipset.js loaded");
}

EPG.Filmtipset = (function ()
{
  var obj = 
  {
    id: "se.filmtipset.Grabber",
    needs : 
    {
      DebugIF : { id: "org.noIp.ghettot.jsframework.interface.singleton.DebugIF" },
      FileLoaderIF : { id: "org.noIp.ghettot.jsframework.interface.singleton.FileLoaderIF" },
      PreferenceIF : { id: "org.noIp.ghettot.jsframework.interface.singleton.PreferenceIF" }
    },
    implementing: 
    {
      LoadIF : { id: "org.noIp.ghettot.jsframework.interface.LoadIF", provides: {} } 
    },
    provides : {}
  },
  Debug,
  FileLoader,
  Preferences,
  BASE_URL = "http://www.filmtipset.se/api/api.cgi?returntype=json&accesskey=",
  ACCESS_KEY = "",
  FT_URL,
  FT_STAR = "\u272D",
  userId,
  callbacks = {},
  lastRefresh = -1,
  ONE_DAY = 86400000,
  cache,
  updateTimeout,
  isUpdating = false,
  PATH_FILMTIPSET_TV_LIST = "Library/Xmltv/schedules/se.filmtipset.tvlist.js",
  channelNameToXmltvId = {};
  
  channelNameToXmltvId.svt1 = "svt1.svt.se";
  channelNameToXmltvId.svt2 = "svt2.svt.se";
  
  callbacks.search = {};
  
  FT_URL = BASE_URL + ACCESS_KEY + "&";
  
  obj.provides.YOUR_PAGE_URL = "http://www.filmtipset.se/yourpage.cgi";
  obj.provides.PREF_NAME_USER_ID = obj.id + ".user.id";
  obj.provides.PREF_NAME_ENABLED = obj.id + ".enabled";
  
  obj.provides.ERROR_MOVIE_NOT_FOUND = -1;
  obj.provides.ERROR_NO_INTERNET_CONNECTION = -2;
  obj.provides.ERROR_UNKNOWN_ERROR = -3;
  obj.provides.ERROR_USER_ID_REQUIRED = -4;
  obj.provides.ERROR_NO_CACHE = -5;
  obj.provides.ERROR_MOVIE_HAS_NO_SCORE = -6;
  obj.provides.CALLBACK_GET_SCORE = 2;
  obj.provides.OK = 1;
  
  obj.implementing.LoadIF.provides.onLoad = function (D, F, S)
  {
    Debug = obj.needs.DebugIF.provides;
    FileLoader = obj.needs.FileLoaderIF.provides;
    Preferences = obj.needs.PreferenceIF.provides;
    if (D && F && S)
    {
      Debug = D;
      FileLoader = F;
      Preferences = S;
    }
  };
  
  obj.implementing.LoadIF.provides.onUnLoad = function () {};
  
  obj.provides.setUserId = function (un)
  {
    if (un * 1 >= 0)
    {
      userId = un;
      Preferences.setPreference(obj.provides.PREF_NAME_USER_ID, un);
    }
    else
    {
      userId = false;
      Preferences.deletePreference(obj.provides.PREF_NAME_USER_ID);
    }
  };
  
  obj.provides.getUserId = function ()
  {
    userId = Preferences.getPreference(obj.provides.PREF_NAME_USER_ID);
    return userId;
  };
  
  obj.provides.setCallbacks = function (type, onSuccess, onFailure)
  {
    if (type === obj.provides.CALLBACK_GET_SCORE)
    {
      if (!callbacks[type])
      {
        callbacks[type] = {};
        callbacks[type].type = type;
        callbacks[type].onSuccesses = [];
        callbacks[type].onFailures = [];
        callbacks[type].programmes = [];
      }
      callbacks[type].onSuccesses.push(onSuccess);
      callbacks[type].onFailures.push(onFailure);
    }
    else
    {
      throw obj.id + " setCallbacks unknown callback type: " + type;
    }
  };
  
  obj.provides.isMovie = function(program)
  {
    try
    {
      var i;
      if (program && program.category && program.category.en && program.category.en.length > 0)
      {
        for (i = 0; i < program.category.en.length; i += 1)
        {
          if (program.category.en[i] === "movie")
          {
            return true;
          }
        }
      }
      else if (program && program.credits && program.credits.director)
      {
        // SVT does not tag their movies with category movie
        return true;
      }
      return false;
    }
    catch (error)
    {
      Debug.alert(obj.id + " isMovie error " + error);
      return false;
    }
  };
  
  function stopUpdate()
  {
    clearTimeout(updateTimeout);
    updateTimeout = false;
    isUpdating = false;
    findScores();
  }
  
  function findScore(program, movies)
  {
    try
    {
      var i,
      movie,
      title;
      if (movies && movies.hashed && program && program.title)
      {
        title = program.title.sv.toLowerCase();
        movie = movies.hashed[program.title.sv.toLowerCase()];
        if (!movie && title.indexOf("the ") === 0)
        {
          movie = movies.hashed[title.substr(4)];
        }
        if (movie)
        {
          if (movie.grade && movie.grade.value * 1 > 0)
          {
            return movie;
          }
          else
          {
            return obj.provides.ERROR_MOVIE_HAS_NO_SCORE;
          }
        }
        else
        {
          return obj.provides.ERROR_MOVIE_NOT_FOUND;
        }
      }
      else
      {
        return obj.provides.ERROR_NO_CACHE;
      }
    }
    catch (error)
    {
      Debug.alert(obj.id + " findScore error " + error);
      return obj.provides.ERROR_UNKNOWN_ERROR;
    }
  }
  
  function runCallbacks(callbacks, program, error)
  {
    var i;
    for (i = 0; i < callbacks.length; i += 1)
    {
      callbacks[i](program, error);
    }
  }
  
  function findScores()
  {
    try
    {
      var callback = callbacks[obj.provides.CALLBACK_GET_SCORE],
      program,
      score;
      while (callback.programmes.length > 0)
      {
        program = callback.programmes.pop();
        if (!cache || (cache && cache.length === 0))
        {
          runCallbacks(callbacks[obj.provides.CALLBACK_GET_SCORE].onFailures, program, obj.provides.ERROR_NO_CACHE);
        }
        else
        {
          score = findScore(program, cache);
          if (score === obj.provides.ERROR_MOVIE_NOT_FOUND || score === obj.provides.ERROR_MOVIE_HAS_NO_SCORE)
          {
            runCallbacks(callbacks[obj.provides.CALLBACK_GET_SCORE].onFailures, program, score);
          }
          else if (score.grade && score.grade.value * 1 > 0)
          {
            //Debug.inform("EPG.Filmtipset findScores " + program.title.sv + " found score " + score.grade.value);
            program.filmtipsetgrade = score.grade; // score.grade is grade can be set by user. If not, it is calculated. score.filmtipsetgrade is always calculated.
            program.imdbid = score.imdb;
            runCallbacks(callbacks[obj.provides.CALLBACK_GET_SCORE].onSuccesses, program);
          }
        }
      }
    }
    catch (error)
    {
      Debug.alert(obj.id + " findScores error " + error);
    }
  }
  
  function downloadTvList(onSuccess)
  {
    try
    {
      FileLoader.downloadFile("\"" + encodeURI(FT_URL + "action=list&id=tv&usernr=" + obj.provides.getUserId()) + "\"", PATH_FILMTIPSET_TV_LIST, onSuccess, findScores, false, true);
    }
    catch (error)
    {
      Debug.alert(obj.id + " downloadTvList error " + error);
    }
  }
  
  function convertDates(movies)
  {
    try
    {
      var i,
      movie,
      time,
      year,
      month,
      day,
      hour,
      minute,
      second,
      title;
      
      movies.hashed = {};
      for (i = 0 ; i < movies.length; i += 1)
      {
        movie = movies[i];
        time = movie.movie["tv-info"].time;
        year = time.substring(0, 4);
        month = (1 * time.substring(5, 7)) - 1;
        day = 1 * time.substring(8, 10);
        hour = 1 * time.substring(11, 13);
        minute = 1 * time.substring(14, 16);
        second = 1 * time.substring(17, 19);
        time = new Date();
        time.setFullYear(year);
        time.setMonth(month);
        time.setDate(day);
        time.setHours(hour);
        time.setMinutes(minute);
        time.setSeconds(second);
        movie.movie["tv-info"].time = time.getTime();
        title = movie.movie.name.toLowerCase();
        movies.hashed[title] = movie.movie;
        if (title.indexOf("the ") === 0)
        {
          movies.hashed[title.substr(4)] = movie.movie;  
        }
      }
      return movies;
    }
    catch (error)
    {
      Debug.alert(obj.id + " convertDates error " + error);
    }
  }
  
  function openTvListSuccess(jsonObj)
  {
    try
    {
      isUpdating = false;
      lastRefresh = new Date().getTime();
      if (jsonObj && jsonObj[0] && jsonObj[0].data && jsonObj[0].data[0] && jsonObj[0].data[0].movies && jsonObj[0].data[0].movies.length > 0)
      {
        cache = convertDates(jsonObj[0].data[0].movies);
      }
      findScores();
    }
    catch (error)
    {
      Debug.alert(obj.id + " openTvListSuccess error " + error);
    }
  }
  
  obj.provides.getScore = function (program)
  {
    try
    {
      if (!program)
      {
        return;
      }
      if (!userId || userId === "")
      {
        userId = obj.provides.getUserId();
        if (!userId || userId === "")
        {
          return obj.provides.ERROR_USER_ID_REQUIRED;
        }
      }
      if (callbacks[obj.provides.CALLBACK_GET_SCORE] && program)
      {
        callbacks[obj.provides.CALLBACK_GET_SCORE].programmes.push(program);
        if (isUpdating)
        {
          //Dont do anything. Callback will be run when update is complete.
        }
        else if (new Date().getTime() - ONE_DAY > lastRefresh)
        {
          Debug.inform("EPG.Filmtipset downloading tv list from Filmtipset and updating cache");
          if (window.widget)
          {
            downloadTvList(openTvListSuccess);
          }
          else
          {
            FileLoader.open(PATH_FILMTIPSET_TV_LIST, openTvListSuccess, function(){downloadTvList(openTvListSuccess);}, false, false, false, true);
          }
          isUpdating = true;
          clearTimeout(updateTimeout);
          updateTimeout = setTimeout(stopUpdate, 5000);
        }
        else
        {
          setTimeout(findScores, 100);
        }
        return obj.provides.OK;
      }
      else if (!program && callbacks[obj.provides.CALLBACK_GET_SCORE])
      {
        Debug.alert(obj.id + "getScore need a program and callback!");
      }
      else
      {
        Debug.alert(obj.id + " getScore no callback registered to retrive score!");
      }
    }
    catch (error)
    {
      Debug.alert(obj.id + " getScore error " + error);
    }
  };
  
  obj.provides.getStars = function (grade)
  {
    var answer = "";
    if (grade && grade.value)
    {
      switch (grade.value * 1)
      {
      case 5:
        answer += FT_STAR;
      case 4:
        answer += FT_STAR;
      case 3:
        answer += FT_STAR;
      case 2:
        answer += FT_STAR;
      case 1:
        answer += FT_STAR;
      default:
        break;
      }
    }
    return answer;
  };
  
  obj.provides.isEnabled = function ()
  {
    return (Preferences.getPreference(obj.provides.PREF_NAME_ENABLED) === "yes");
  };
  
  obj.provides.setEnabled = function (enabled)
  {
    if (enabled)
    {
      Settings.setPreference(obj.id + ".enabled", "yes");
    }
    else
    {
      Settings.deletePreference(obj.id + ".enabled");
    }
  };
  
  return obj;
}());
EPG.Filmtipset.implementing.LoadIF.provides.onLoad(EPG.debug, EPG.file, EPG.settings);
EPG.Filmtipset = EPG.Filmtipset.provides;
EPG.PreLoader.resume();