import { CompV1 } from "./index";
import Chart from "../Chart";
import Score from "../Score";

import barsAfricanFlower from "../../test-data/barsAfricanFlower";
import barsAfternoon from "../../test-data/barsAfternoonInParis";
import barsAiregin from "../../test-data/barsAiregin";
import barsAguaDeBeber from "../../test-data/barsAguaDeBeber";
import barsAlfie from "../../test-data/barsAlfie";
import barsAlice from "../../test-data/barsAliceInWonderland";
import barsAllBlues from "../../test-data/barsAllBlues";
import barsAllByMyself from "../../test-data/barsAllByMyself";
import barsAllofMe from "../../test-data/barsAllofMe";
import barsAllofYou from "../../test-data/barsAllofYou";
import barsAlltheThings from "../../test-data/barsAllTheThings";
import barsAloneTogether from "../../test-data/barsAloneTogether";
import barsAnthro from "../../test-data/barsAnthropology";
import barsBillie from "../../test-data/barsBilliesBounce";

const charts = [
    new Chart(() => {}, barsAfricanFlower, "D#|Eb", [ 120, 4 ]),
    new Chart(() => {}, barsAfternoon, "C", [ 120, 4 ]),
    new Chart(() => {}, barsAiregin, "G#|Ab", [ 120, 4 ]),
    new Chart(() => {}, barsAguaDeBeber, "G#|Ab", [ 120, 4 ]),
    new Chart(() => {}, barsAlfie, "C", [ 120, 4 ]),
    new Chart(() => {}, barsAlice, "C", [ 120, 4 ]),
    new Chart(() => {}, barsAllBlues, "G", [ 120, 4 ]),
    new Chart(() => {}, barsAllByMyself, "C", [ 120, 4 ]),
    new Chart(() => {}, barsAllofMe, "C", [ 120, 4 ]),
    new Chart(() => {}, barsAllofYou, "D#|Eb", [ 120, 4 ]),
    new Chart(() => {}, barsAlltheThings, "G#|Ab", [ 120, 4 ]),
    new Chart(() => {}, barsAloneTogether, "F", [ 120, 4 ]),
    new Chart(() => {}, barsAnthro, "A#|Bb", [ 120, 4 ]),
    new Chart(() => {}, barsBillie, "A#|Bb", [ 120, 4 ])
];

/**
 * GENERAL COMPING TESTS
 */

test("CompV1 does not throw error when passed any standard", () => {
    let score: Score | undefined;

    for (let chart of charts) {
        score = undefined;

        for (let i = 0; i < 20; i ++) {
            expect(() => { score = CompV1(chart, score); }).not.toThrow();
        }
    }
});