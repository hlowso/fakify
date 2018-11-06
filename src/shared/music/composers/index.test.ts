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
import barsBewitched from "../../test-data/barsBewitched";
import barsBillie from "../../test-data/barsBilliesBounce";
import barsBlackOrpheus from "../../test-data/barsBlackOrpheus";
import barsBlueBossa from "../../test-data/barsBlueBossa";
import barsBlueInGreen from "../../test-data/barsBlueInGreen";
import barsBodyandSoul from "../../test-data/barsBodyandSoul";
import barsButNotForMe from "../../test-data/barsButNotForMe";
import barsCherokee from "../../test-data/barsCherokee";
import barsConfirmation from "../../test-data/barsConfirmation";
import barsDaysOfWine from "../../test-data/barsDaysofWineandRoses";
import barsDontGetAround from "../../test-data/barsDontGetAroundMuchAnymore";
import barsFlyMeToTheMoon from "../../test-data/barsFlyMeToTheMoon";
import barsFootprints from "../../test-data/barsFootprints";
import barsFour from "../../test-data/barsFour";
import barsGiantSteps from "../../test-data/barsGiantSteps";
import barsHaveYouMet from "../../test-data/barsHaveYouMetMIssJones";
import barsHowHigh from "../../test-data/barsHowHighTheMoon";
import barsIHearARhapsody from "../../test-data/barsIHearARhapsody";
import barsILoveYou from "../../test-data/barsILoveYou";
import barsIRememberYou from "../../test-data/barsIRememberYou";
import barsIllRememberApril from "../../test-data/barsIllRememberApril";
import barsImOldFashioned from "../../test-data/barsImOldFashioned";
import barsIfIShouldLoseYou from "../../test-data/barsIfIShouldLoseYou";
import barsInAMellowTone from "../../test-data/barsInAMellowTone";
import barsSentimental from "../../test-data/barsInASentimentalMood";
import barsMisty from "../../test-data/barsMisty";
import barsFunny from "../../test-data/barsMyFunnyValentine";
import barsOleo from "../../test-data/barsOleo";
import barsSatin from "../../test-data/barsSatinDoll";
import barsScrapple from "../../test-data/barsScrappleFromTheApple";
import barsStella from "../../test-data/barsStellaByStarlight";
import barsSolar from "../../test-data/barsSolar";
import barsSomeDay from "../../test-data/barsSomeDayMyPrinceWillCome";
import barsTakeFive from "../../test-data/barsTakeFive";
import barsTakeTheATrain from "../../test-data/barsTakeTheATrain";
import barsTheGirlFromIpanema from "../../test-data/barsTheGirlFromIpanema";
import barsThereIsNoGreaterLove from "../../test-data/barsThereIsNoGreaterLove";
import barsThereWillNever from "../../test-data/barsThereWillNeverBeAnotherYou";
import barsUpJumpedSpring from "../../test-data/barsUpJumpedSpring";
import barsWhispering from "../../test-data/barsWhispering";
import barsYesterdays from "../../test-data/barsYesterdays";

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
    new Chart(() => {}, barsBewitched, "C", [ 120, 4 ]),
    new Chart(() => {}, barsBillie, "A#|Bb", [ 120, 4 ]),
    new Chart(() => {}, barsBlackOrpheus, "C", [ 120, 4 ]),
    new Chart(() => {}, barsBlueBossa, "D#|Eb", [ 120, 4 ]),
    new Chart(() => {}, barsBlueInGreen, "C", [ 120, 4 ]),
    new Chart(() => {}, barsBodyandSoul, "C#|Db", [ 120, 4 ]),
    new Chart(() => {}, barsButNotForMe, "C#|Db", [ 120, 4 ]),
    new Chart(() => {}, barsCherokee, "A#|Bb", [ 120, 4 ]),
    new Chart(() => {}, barsConfirmation, "A#|Bb", [ 120, 4 ]),
    new Chart(() => {}, barsDaysOfWine, "F#|Gb", [ 120, 4 ]),
    new Chart(() => {}, barsDontGetAround, "C", [ 120, 4 ]),
    new Chart(() => {}, barsFlyMeToTheMoon, "C", [ 120, 4 ]),
    new Chart(() => {}, barsFootprints, "C", [ 120, 4 ]),
    new Chart(() => {}, barsFour, "C", [ 120, 4 ]),
    new Chart(() => {}, barsGiantSteps, "D#|Eb", [ 120, 4 ]),
    new Chart(() => {}, barsHaveYouMet, "F", [ 120, 4 ]),
    new Chart(() => {}, barsHowHigh, "F", [ 120, 4 ]),
    new Chart(() => {}, barsIHearARhapsody, "D#|Eb", [ 120, 4 ]),
    new Chart(() => {}, barsILoveYou, "F", [ 120, 4 ]),
    new Chart(() => {}, barsIRememberYou, "F", [ 120, 4 ]),
    new Chart(() => {}, barsIllRememberApril, "G", [ 120, 4 ]),
    new Chart(() => {}, barsImOldFashioned, "D", [ 120, 4 ]),
    new Chart(() => {}, barsIfIShouldLoseYou, "D#|Eb", [ 120, 4 ]),
    new Chart(() => {}, barsInAMellowTone, "G#|Ab", [ 120, 4 ]),
    new Chart(() => {}, barsSentimental, "D", [ 120, 4 ]),
    new Chart(() => {}, barsMisty, "D#|Eb", [ 120, 4 ]),
    new Chart(() => {}, barsFunny, "C", [ 120, 4 ]),
    new Chart(() => {}, barsOleo, "A#|Bb", [ 120, 4 ]),
    new Chart(() => {}, barsSatin, "C", [ 120, 4 ]),
    new Chart(() => {}, barsScrapple, "F", [ 120, 4 ]),
    new Chart(() => {}, barsSolar, "C", [ 120, 4 ]),
    new Chart(() => {}, barsSomeDay, "A#|Bb", [ 120, 4 ]),
    new Chart(() => {}, barsStella, "A#|Bb", [ 120, 4 ]),
    new Chart(() => {}, barsTakeFive, "D#|Eb", [ 120, 4 ]),
    new Chart(() => {}, barsTakeTheATrain, "C", [ 120, 4 ]),
    new Chart(() => {}, barsTheGirlFromIpanema, "F", [ 120, 4 ]),
    new Chart(() => {}, barsThereIsNoGreaterLove, "A#|Bb", [ 120, 4 ]),
    new Chart(() => {}, barsThereWillNever, "A#|Bb", [ 120, 4 ]),
    new Chart(() => {}, barsUpJumpedSpring, "A#|Bb", [ 120, 4 ]),
    new Chart(() => {}, barsWhispering, "D#|Eb", [ 120, 4 ]),
    new Chart(() => {}, barsYesterdays, "D", [ 120, 4 ])
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