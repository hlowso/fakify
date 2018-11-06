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
            "6",
            "Dom7$5"
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
          "beatIdx": 2,
          "chordName": [
            "U",
            "Dim7"
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
            "5",
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
            "T",
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
            "7",
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
            "4",
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
            "3",
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
            "4",
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
            "H",
            "Min7b5"
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
            "T",
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
            "Min7b5"
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
            "Dom7$5"
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
          "beatIdx": 2,
          "chordName": [
            "U",
            "Dim7"
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
            "5",
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
            "T",
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
            "7",
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
            "4",
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
            "3",
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
            "4",
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
            "Min7b5"
          ]
        },
        {
          "beatIdx": 1,
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
            "3",
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
            "J",
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
            "N",
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
            "6",
            "Dom7$5"
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
          "beatIdx": 2,
          "chordName": [
            "U",
            "Dim7"
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
            "5",
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
            "T",
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
            "7",
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
            "4",
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
            "3",
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
            "4",
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
            "H",
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
            "Maj7"
          ]
        }
      ]
    }
  ] as IChartBar[];

  export default bars;