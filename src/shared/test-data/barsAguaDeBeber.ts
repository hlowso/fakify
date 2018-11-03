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
          "Dom7$9"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "5",
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
          "1",
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
          "Dom7$9"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "5",
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
          "1",
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
          "1",
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
          "1",
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
          "Dom7$9"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "5",
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
          "1",
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
          "Dom7$9"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "5",
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
          "1",
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
          "1",
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
          "1",
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
          "5",
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
          "1",
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
          "1",
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
          "4",
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
          "J",
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
          "N",
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
          "N",
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
          "Dom7"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "H",
          "Dom7b5"
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
          "7",
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
          "N",
          "Dom9"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "N",
          "Dom7$9"
        ]
      },
      {
        "beatIdx": 3,
        "chordName": [
          "2",
          "Dom7$9"
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
          "Dom7$9"
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
          "5",
          "Sus49"
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
          "1",
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
          "1",
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
          "4",
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
          "1",
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
          "1",
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
          "Dom7$9"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "5",
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
          "1",
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
          "Dom7$9"
        ]
      },
      {
        "beatIdx": 2,
        "chordName": [
          "5",
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
          "1",
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
          "1",
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
          "1",
          "Min7"
        ]
      }
    ]
  }
] as IChartBar[];

  export default bars;