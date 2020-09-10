import { isString, isFunction, transition } from '@vue-interface/utils';

export default {

    props: {

        /**
         * The cancel callback. 
         *
         * @type {Function}
         * @return {Promise}
         */
        cancel: {
            type: Function,
            default(e) {
                return new Promise((resolve, reject) => {
                    this.$emit('cancel', e, resolve, reject);

                    if(!e.defaultPrevented) {                    
                        return this.close(() => resolve(e));
                    }
                    
                    reject(new Error('Cancelation rejected!'));
                });
            }
        },

        /**
         * The confirm callback. 
         *
         * @type {Function}
         * @return {Promise}
         */
        confirm: {
            type: Function,
            default(e) {
                return new Promise((resolve, reject) => {
                    this.$emit('confirm', e);

                    if(!e.defaultPrevented) {                    
                        return this.close(() => resolve(e));
                    }
                    
                    reject(new Error('Confirmation rejected!'));
                });
            }
        },

        /**
         * The duration length.
         *
         * @type {String}
         */
        duration: String,

        /**
         * Is the triggerable element showing.
         *
         * @property Boolean
         */
        show: {
            type: Boolean,
            defaut: false
        },

        /**
         * The show class.
         *
         * @type {String}
         */
        showClass: {
            type: String,
            default: 'show'
        },

        /**
         * The target element used to position the popover.
         *
         * @type {String|Element|Boolean}
         */
        target: {
            type: [Function, String, Element, Boolean],
            default: false
        },

        /**
         * How the modal is triggered - click | hover | focus | manual. You may
         * pass multiple triggers; separate them with a space. `manual` cannot
         * be combined with any other trigger.
         *
         * @type {String}
         */
        trigger: {
            type: [String, Array],
            default: 'click'
        }

    },

    methods: {

        divideUnit(dividend, divisor) {
            const [ match, value, unit ] = dividend.match(/^(\d+)(\w+)/);

            if(match) {
                return `${parseFloat(value, 10) / divisor}${unit}`;
            }

            return dividend;
        },

        /**
         * Initialize the trigger event for the specified elements
         *
         * @param  {Element} el
         * @return {void}
         */
        initializeTrigger(el) {
            (isString(this.trigger) ? this.trigger.split(' ') : this.trigger)
                .forEach(trigger => {
                    el.addEventListener(trigger, event => {
                        this.toggle();

                        event.preventDefault();
                    });
                });
        },

        /**
         * Initialize the event triggers
         *
         * @return void
         */
        initializeTarget() {
            if(this.target && this.trigger !== 'manual') {
                if(isFunction(this.target)) {
                    let target = this.target(this);

                    if(isString(target)) {
                        this.initializeSelector(target);
                    }
                    else {
                        this.initializeTrigger(target);
                    }
                }
                else if(this.target instanceof Element) {
                    this.initializeTrigger(this.target);
                }
                else {
                    this.initializeSelector(this.target);
                }
            }
        },

        /**
         * Initialize the event triggers on a selector
         *
         * @return void
         */
        initializeSelector(selector) {
            document
                .querySelectorAll(selector)
                .forEach(el => this.initializeTrigger(el));
        },

        /**
         * Focus on the first field in the modal (if exists).
         *
         * @return this
         */
        focus() {
            this.$nextTick(() => {
                const el = this.$el.querySelector('input, select, textarea');

                if(el) {
                    el.focus();
                }
                else {
                    this.$el.focus();
                }
            });

            return this;
        },

        /**
         * Open the triggereable element
         *
         * @return this
         */
        open(fn) {            
            if(!this.isDisplaying) {
                this.$nextTick(() => {
                    this.isDisplaying = true;

                    transition(this.$el, this.duration).then(() => {
                        this.isShowing = true;
                    
                        if(isFunction(fn)) {
                            fn(this);
                        }
                    
                        this.$emit('open');
                    });
                });
            }

            return this;
        },

        /**
         * Close the triggereable element
         *
         * @return this
         */
        close(fn) {
            if(this.isShowing) {
                this.$nextTick(() => {
                    this.isShowing = false;

                    transition(this.$el, this.duration).then(delay => {
                        this.isDisplaying = false;
                        
                        if(isFunction(fn)) {
                            fn(this);
                        }

                        this.$emit('close');
                    });
                });
            }

            return this;
        },

        /**
         * Toggle the triggereable element's open/close method.
         *
         * @return this
         */
        toggle() {
            if(!this.isShowing) {
                this.open();
            }
            else {
                this.cancel();
            }

            return this;
        }

    },

    computed: {

        triggerableClasses() {
            return {
                [this.showClass]: this.isShowing
            };
        }

    },

    watch: {

        isShowing(value) {
            if(value) {
                this.focus();
            }
        },

        show(value) {
            this.isShowing = value;
        }

    },

    mounted() {
        this.initializeTarget();
        
        if(this.show) {
            this.open();
        }
    },

    data() {
        return {
            isShowing: false,
            isDisplaying: false,
        };
    }

};
