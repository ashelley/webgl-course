export default class PseudoRandom {
    m = 0x80000000 // 2**31
    a = 1103515245
    c = 12345

    state: number

    constructor(seed: number) {
        this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
    }

    nextInt() {
        this.state = (this.a * this.state + this.c) % this.m;
        return this.state;
    }

    nextFloat() {
        // returns in range [0,1]
        return this.nextInt() / (this.m - 1);
    }
    nextRange(start, end) {
        // returns in range [start, end): including start, excluding end
        // can't modulu nextInt because of weak randomness in lower bits
        var rangeSize = end - start;
        var randomUnder1 = this.nextInt() / this.m;
        return start + Math.floor(randomUnder1 * rangeSize);
    }

    choice(array) {
        return array[this.nextRange(0, array.length)];
    }
}
