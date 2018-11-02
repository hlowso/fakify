import { IChartBar } from "../types";

const bars = [
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "1",
          "Maj6"
        ],
        "key": "1"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "1",
          "Maj6"
        ],
        "key": "1"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "3",
          "Dom7"
        ],
        "key": "6"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "3",
          "Dom7"
        ],
        "key": "6"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "6",
          "Dom7"
        ],
        "key": "2"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "6",
          "Dom7"
        ],
        "key": "2"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "2",
          "Min7"
        ],
        "key": "J"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "2",
          "Min7"
        ],
        "key": "J"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "3",
          "Dom7"
        ],
        "key": "6"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "3",
          "Dom7"
        ],
        "key": "6"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "6",
          "Min7"
        ],
        "key": "5"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "6",
          "Min7"
        ],
        "key": "5"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "2",
          "Dom7"
        ],
        "key": "5"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "2",
          "Dom7"
        ],
        "key": "5"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "2",
          "Min7"
        ],
        "key": "1"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "5",
          "Dom7"
        ],
        "key": "1"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "1",
          "Maj6"
        ],
        "key": "1"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "1",
          "Maj6"
        ],
        "key": "1"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "3",
          "Dom7"
        ],
        "key": "6"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "3",
          "Dom7"
        ],
        "key": "6"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "6",
          "Dom7"
        ],
        "key": "2"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "6",
          "Dom7"
        ],
        "key": "2"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "2",
          "Min7"
        ],
        "key": "4"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "2",
          "Min7"
        ],
        "key": "4"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "4",
          "Maj6"
        ],
        "key": "4"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "4",
          "Min6"
        ],
        "key": "H"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "1",
          "Maj7"
        ],
        "key": "1"
      },
      {
        "beatIdx": 2,
        "chordName": [
          "3",
          "Min7b5"
        ],
        "key": "1"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "6",
          "Dom7"
        ],
        "key": "2"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "2",
          "Min7"
        ],
        "key": "1"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "5",
          "Dom7"
        ],
        "key": "1"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "1",
          "Maj6"
        ],
        "key": "1"
      }
    ]
  },
  {
    "timeSignature": [
      4,
      4
    ],
    "chordSegments": [
      {
        "beatIdx": 0,
        "chordName": [
          "1",
          "Maj6"
        ],
        "key": "1"
      }
    ]
  }
] as IChartBar[];

export default bars;