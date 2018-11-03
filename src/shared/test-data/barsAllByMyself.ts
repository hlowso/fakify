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
          "Maj7"
        ]
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
        ]
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
        ]
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
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "2",
          "Dom7"
        ]
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
        ]
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
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "5",
          "Dom7"
        ]
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
          "Min7"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "6",
          "Dom7"
        ]
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
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "5",
          "Dom7"
        ]
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
        ]
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
        ]
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
          "T",
          "Min7"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "7",
          "Dom7"
        ]
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
        ]
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
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "6",
          "Min7b5"
        ]
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
        ]
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
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "2",
          "Min7b5"
        ]
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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "2",
          "Dom7"
        ]
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
        ]
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
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "5",
          "Dom7"
        ]
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
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "3",
          "Dom7$5"
        ]
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
        ]
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
          "Maj7"
        ]
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
          "T",
          "Dim7"
        ]
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
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "7",
          "Dom7$5"
        ]
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
          "Min7b5"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "6",
          "Dom7"
        ]
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
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "2",
          "Dom7"
        ]
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
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "5",
          "Dom7"
        ]
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
        ]
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
        ]
      }
    ]
  }
] as IChartBar[];

  export default bars;