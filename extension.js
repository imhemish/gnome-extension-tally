import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

const CounterButton = GObject.registerClass(
    class CounterButton extends PanelMenu.Button {
        _init(settings) {
            super._init(0.0, 'Tally', true);

            this._settings = settings;

            this._label = new St.Label({
                y_align: Clutter.ActorAlign.CENTER,
                text: this._buildText(),
            });
            this.add_child(this._label);

            this._settings.connectObject(
                'changed::count', () => this._refresh(),
                'changed::show-label', () => this._refresh(),
                'changed::label-text', () => this._refresh(),
                this
            );

            this.connectObject(
                'button-press-event', (_actor, event) => {
                    const btn = event.get_button();
                    if (btn === 1)
                        this._settings.set_int('count', this._settings.get_int('count') + 1);
                    else if (btn === 3)
                        this._settings.set_int('count', this._settings.get_int('count') - 1);
                    return Clutter.EVENT_STOP;
                },
                this
            );
        }

        _buildText() {
            const count = this._settings.get_int('count');
            const showLabel = this._settings.get_boolean('show-label');
            const labelText = this._settings.get_string('label-text').trim();

            if (showLabel && labelText.length > 0)
                return `${labelText}: ${count}`;
            return `${count}`;
        }

        _refresh() {
            this._label.set_text(this._buildText());
        }

        destroy() {
            this._settings.disconnectObject(this);
            this.disconnectObject(this);
            super.destroy();
        }
    });

export default class TallyExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._button = new CounterButton(this._settings);

        this._placeButton();

        this._settings.connectObject(
            'changed::position-right', () => this._replaceButton(),
            this
        );
    }

    disable() {
        this._settings.disconnectObject(this);
        this._destroyButton();
        this._settings = null;
    }

    _placeButton() {
        const onRight = this._settings.get_boolean('position-right');
        if (onRight)
            Main.panel.addToStatusArea('tally', this._button, 0, 'right');
        else
            Main.panel.addToStatusArea('tally', this._button, -1, 'left');
    }

    _destroyButton() {
        if (this._button) {
            delete Main.panel.statusArea['tally'];
            this._button.destroy();
            this._button = null;
        }
    }

    _replaceButton() {
        this._destroyButton();
        this._button = new CounterButton(this._settings);
        this._placeButton();
    }
}