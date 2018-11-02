import { CompV1 } from "./index";
import Chart from "../Chart";
import Score from "../Score";
import { Feel } from "../../types";

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

const charts = [
    new Chart(() => {}, barsAfricanFlower, "D#|Eb", [ 120, 4 ], Feel.Swing),
    new Chart(() => {}, barsAfternoon, "C", [ 120, 4 ], Feel.Swing),
    new Chart(() => {}, barsAiregin, "G#|Ab", [ 120, 4 ], Feel.Swing),
    new Chart(() => {}, barsAguaDeBeber, "G#|Ab", [ 120, 4 ], Feel.Swing),
    new Chart(() => {}, barsAlfie, "C", [ 120, 4 ], Feel.Swing),
    new Chart(() => {}, barsAlice, "C", [ 120, 4 ], Feel.Swing),
    new Chart(() => {}, barsAllBlues, "G", [ 120, 4 ], Feel.Swing),
    new Chart(() => {}, barsAllByMyself, "C", [ 120, 4 ], Feel.Swing),
    new Chart(() => {}, barsAllofMe, "C", [ 120, 4 ], Feel.Swing),
    new Chart(() => {}, barsAllofYou, "D#|Eb", [ 120, 4 ], Feel.Swing),
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