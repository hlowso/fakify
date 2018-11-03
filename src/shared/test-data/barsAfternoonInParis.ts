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
          "Min7"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "4",
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
          "J",
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
          "J",
          "Min7"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "N",
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
          "U",
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
          "2",
          "Min7"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "5",
          "Dom7b9"
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
          "6",
          "Min7"
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
          "Min7"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "4",
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
          "J",
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
          "J",
          "Min7"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "N",
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
          "U",
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
          "2",
          "Min7"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "5",
          "Dom7b9"
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
          "Maj7"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "6",
          "Min7"
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
          "6",
          "Min7"
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
          "H",
          "Min7"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "T",
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
          "Dom7"
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
          "Min7"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "4",
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
          "J",
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
          "J",
          "Min7"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "N",
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
          "U",
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
          "2",
          "Min7"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "5",
          "Dom7b9"
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
          "Maj7"
        ]
      }
    ]
  }
] as IChartBar[];

  export default bars;