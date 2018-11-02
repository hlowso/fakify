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
            "Min6"
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
            "Maj7"
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
            "7",
            "Min7b5"
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
            "Dom7b9"
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
            "2",
            "Min6"
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
            "6",
            "Maj7"
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
            "H",
            "Min7"
          ],
          "key": "7"
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
            "Dim7"
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
            "7",
            "Min7"
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
            "Maj7"
          ],
          "key": "6"
        },
        {
          "beatIdx": 2,
          "chordName": [
            "U",
            "Dom7"
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
            "H",
            "Min7b5"
          ],
          "key": "7"
        },
        {
          "beatIdx": 2,
          "chordName": [
            "T",
            "Dom7b9"
          ],
          "key": "7"
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
            "7",
            "Min7"
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
            "2",
            "Min6"
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
            "6",
            "Maj7"
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
            "7",
            "Min7b5"
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
            "Dom7b9"
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
            "2",
            "Min6"
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
            "6",
            "Maj7"
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
            "H",
            "Min7"
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
            "T",
            "Min7b9"
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
            "2",
            "Maj7"
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
            "N",
            "Min7b5"
          ],
          "key": "H"
        },
        {
          "beatIdx": 2,
          "chordName": [
            "U",
            "Dom7b9"
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
            "H",
            "Min7"
          ],
          "key": "6"
        },
        {
          "beatIdx": 2,
          "chordName": [
            "U",
            "b9"
          ],
          "key": "U"
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
            "Dom7"
          ],
          "key": "7"
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
            "7",
            "Min7"
          ],
          "key": "5"
        },
        {
          "beatIdx": 2,
          "chordName": [
            "T",
            "Dom7"
          ],
          "key": "7"
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
            "7",
            "Min7"
          ],
          "key": "6"
        },
        {
          "beatIdx": 2,
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
            "Maj6"
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
            "Maj6"
          ],
          "key": "6"
        }
      ]
    }
  ] as IChartBar[];

  export default bars;