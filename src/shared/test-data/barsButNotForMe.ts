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
            "Min"
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
            "5",
            "Min7"
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
            "4",
            "Min7"
          ]
        },
        {
          "beatIdx": 2,
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
            "Min"
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
            "5",
            "Min7"
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
            "4",
            "Min7"
          ]
        },
        {
          "beatIdx": 2,
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