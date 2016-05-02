_.contains = function(s, t) {
  return s.indexOf(t) != -1;
};

var tempo = 120, signature = 4, beatDur = 60/tempo, barDur = signature * beatDur;

// create web audio api context
var audioContext = new (window.AudioContext || window.webkitAudioContext)();
// var gainNode.connect(audioContext.destination);

var clock = new WAAClock(audioContext);

var createOscillator = function(type, frequency, destination) {
  var oscillator = audioContext.createOscillator();
  oscillator.type = type || 'square';
  oscillator.frequency.value = frequency || 3000; // value in hertz
  oscillator.connect(destination || audioContext.destination);
  return oscillator;
};

var getOneBeatOscillatorFunction = function(beat) {
  var oscillator = createOscillator();
  console.log("Generating oscillator for beat", beat);
  return function() {
    console.log("Trying to run oscillator for beat",beat);
    oscillator.start(beat);
    oscillator.stop(beat+1);
  };
};

var rangePattern = /(\d+?)(?:-(\d+?))?(?:\/(\d+?))?(?:,|$)/g;

var parseWhen = function(whens) {
  return _.map(whens, function(when) {
    if (when === '*') {
      return {every: true};
    }
    if (when.startsWith('*/')) {
      return {divisible: parseInt(when.split('/')[1])};
    }
    return {
      on: _.chain(when.match(rangePattern))
            .map(function(t) {
              // t is either an int or a range.
              return _.contains(t, '-') ? 
                _.range.apply(null, 
                    _.map(t.split('-'), 
                      function(v, i) { 
                        // By adding the index to the parsed value, we really mean that we want to add 1 to the end of the range
                        // because _.range() is not inclusive by default.
                        return _.parseInt(v) + i; 
                      }
                    )
                  ) 
                : _.parseInt(t);
            })
            .flatten()
            .uniq()
            .value()
    };
  });
};

var whatPattern = /(\w+)\(((?:["']?\w+["'']?,?\s*?)+)\)/;
var parseWhat = function(what) {
  var parsed = what.match(whatPattern);
  return {
    type: parsed[1],
    arguments: _.chain(parsed[2])
      .split(',')
      .map(_.trim)
      .value()
  }
};

var parseTab = function(input, differentNoteLengths) {
  var lengths = differentNoteLengths || 6;
  var lines = input.split("\n");
  return _.map(lines, function(line) {
    var splitLine = line.split(/\s/);
    return {
      when: parseWhen(splitLine.slice(0, lengths)),
      what: parseWhat(splitLine.slice(lengths)[0])
    };
  });
};

/**
 * args:
 *  0 - frequency - integer - in hz
 *  1 - duration - float - in beats
 */
var generateOscillator = function(type, beat, args) {
  var oscillator = createOscillator(type, _.parseInt(args[0]));
  var duration = parseFloat(args[1]) || 0.125;
  return function() {
    console.log("square on beat", beat);
    oscillator.start(beat);
    oscillator.stop(beat + duration);
  };
};

var instruments = {
  'square': _.bind(generateOscillator, null, 'square'),
  'saw': _.bind(generateOscillator, null, 'sawtooth')
};

var shouldPlayOnThisBeat = function(beat, whens, differentNoteLengths) {
  /*
   * 
   */
  var intervals = _.map(_.range(differentNoteLengths - 1, 0), function(exp) { return 1.0 / Math.pow(2, exp); }).concat([1.0]);
  var whenIndex = intervals.indexOf(beat % 1 || 1);  // If it's 0, it's equivalent to 1.
  if (whenIndex == -1) {
    return false;
  }
  var interval = intervals[whenIndex];
  var when = whens[whenIndex];
  if (when.pass) {
    return false;
  }

  if (when.every) {
    return true;
  };

  if (_.has(when, 'on') && _.contains(when.on, beat/interval)) {
    return true;
  }

  if (_.has(when, 'divisible') && (beat/interval) % when.divisible == 0) {
    return true;
  }
};

// TODO: Figure out play length, right now everything plays for one beat

var playTab = function(rawTab, differentNoteLengths) {
  var lengths = differentNoteLengths || 6;
  var minimalDistance = 1.0/Math.pow(2, lengths - 1);
  var tab = parseTab(rawTab, lengths);
  var tracks = [];
  clock.start();
  console.log(JSON.stringify(tab, null, 2));
  for (var beat = 0; beat < tempo + 1; beat += minimalDistance) {
    _.each(tab, function(line) {
      if (shouldPlayOnThisBeat(beat, line.when, lengths)) {
        console.log('Beat', beat,':', JSON.stringify(line));
        tracks.push(clock.callbackAtTime(instruments[line.what.type](beat, line.what.arguments)()), beat)
      }
    });
  }
};

// playTab("0 0 0 0 * * square(440)");
playTab("0 0 * * * * saw(440)");
// playTab("0 */3 * * * * square(440)");
playTab("*/7 * * * * * square(440)");
