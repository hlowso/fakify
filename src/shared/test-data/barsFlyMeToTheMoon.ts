import { IChartBar } from "../types";

const bars = [
    {
      "timeSignature": [
        3,
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
        3,
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
        3,
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
        3,
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
            "1",
            "Dom7"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
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
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "7",
            "Dim"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
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
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "6",
            "Min"
          ]
        },
        {
          "beatIdx": 2,
          "chordName": [
            "6",
            "Dom7b9"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
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
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "5",
            "Dom7"
          ]
        },
        {
          "beatIdx": 1,
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
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "3",
            "Min"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "6",
            "Dom7"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
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
        3,
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
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "5",
            "Dom7"
          ]
        },
        {
          "beatIdx": 2,
          "chordName": [
            "1",
            "Maj7"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "7",
            "Min7"
          ]
        },
        {
          "beatIdx": 2,
          "chordName": [
            "3",
            "Dom7"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
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
        3,
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
        3,
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
        3,
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
            "1",
            "Dom7"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
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
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "7",
            "Dim"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
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
        3,
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
            "Dom7"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
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
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "5",
            "Dom7"
          ]
        },
        {
          "beatIdx": 1,
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
        3,
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
            "3",
            "Dim"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "6",
            "Dom7"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
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
        3,
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
        3,
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
        3,
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
        3,
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
        3,
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
        3,
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
        3,
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
            "1",
            "Dom7"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
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
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "7",
            "Dim"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
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
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "6",
            "Min"
          ]
        },
        {
          "beatIdx": 2,
          "chordName": [
            "6",
            "Dom7b9"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
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
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "5",
            "Dom7"
          ]
        },
        {
          "beatIdx": 1,
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
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "3",
            "Min"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "6",
            "Dom7"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
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
        3,
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
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "5",
            "Dom7"
          ]
        },
        {
          "beatIdx": 2,
          "chordName": [
            "1",
            "Maj7"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "7",
            "Min7"
          ]
        },
        {
          "beatIdx": 2,
          "chordName": [
            "3",
            "Dom7"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
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
        3,
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
        3,
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
        3,
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
            "1",
            "Dom7"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
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
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "7",
            "Dim"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
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
        3,
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
            "Dom7"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
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
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "5",
            "Dom7"
          ]
        },
        {
          "beatIdx": 1,
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
        3,
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
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "1",
            "Dom7"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "4",
            "Maj6"
          ]
        }
      ]
    },
    {
      "timeSignature": [
        3,
        4
      ],
      "chordSegments": [
        {
          "beatIdx": 0,
          "chordName": [
            "5",
            "Dom7"
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
        3,
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
        3,
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