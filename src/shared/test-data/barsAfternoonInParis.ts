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
            "Min7"
          ],
          "key": "J"
        },
        {
          "beatIdx": 2,
          "chordName": [
            "4",
            "Dom7"
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
            "J",
            "Maj7"
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
            "J",
            "Min7"
          ],
          "key": "U"
        },
        {
          "beatIdx": 2,
          "chordName": [
            "N",
            "Dom7"
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
            "U",
            "Maj7"
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
            "2",
            "Min7"
          ],
          "key": "1"
        },
        {
          "beatIdx": 2,
          "chordName": [
            "5",
            "Dom7b9"
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
            "Maj7"
          ],
          "key": "1"
        },
        {
          "beatIdx": 2,
          "chordName": [
            "6",
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
            "2",
            "Min7"
          ],
          "key": "1"
        },
        {
          "beatIdx": 2,
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
            "Maj7"
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
            "Min7"
          ],
          "key": "J"
        },
        {
          "beatIdx": 2,
          "chordName": [
            "4",
            "Dom7"
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
            "J",
            "Maj7"
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
            "J",
            "Min7"
          ],
          "key": "U"
        },
        {
          "beatIdx": 2,
          "chordName": [
            "N",
            "Dom7"
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
            "U",
            "Maj7"
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
            "2",
            "Min7"
          ],
          "key": "1"
        },
        {
          "beatIdx": 2,
          "chordName": [
            "5",
            "Dom7b9"
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
            "Maj7"
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
            "Maj7"
          ],
          "key": "1"
        },
        {
          "beatIdx": 2,
          "chordName": [
            "6",
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
            "Maj7"
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
            "2",
            "Dom7"
          ],
          "key": "5"
        },
        {
          "beatIdx": 2,
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
            "Maj7"
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
            "Min7"
          ],
          "key": "J"
        },
        {
          "beatIdx": 2,
          "chordName": [
            "4",
            "Dom7"
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
            "J",
            "Maj7"
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
            "J",
            "Min7"
          ],
          "key": "U"
        },
        {
          "beatIdx": 2,
          "chordName": [
            "N",
            "Dom7"
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
            "U",
            "Maj7"
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
            "2",
            "Min7"
          ],
          "key": "1"
        },
        {
          "beatIdx": 2,
          "chordName": [
            "5",
            "Dom7b9"
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
            "Maj7"
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
            "Maj7"
          ],
          "key": "1"
        }
      ]
    }
  ] as IChartBar[];

  export default bars;