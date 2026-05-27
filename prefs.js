import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class TallyPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const settingsPage = new Adw.PreferencesPage({
            title: _('Settings'),
            icon_name: 'preferences-system-symbolic',
        });
        window.add(settingsPage);

        const counterGroup = new Adw.PreferencesGroup({
            title: _('Counter'),
            description: _('Left-click increments, right-click decrements.'),
        });
        settingsPage.add(counterGroup);

        const countRow = new Adw.SpinRow({
            title: _('Current count'),
            subtitle: _('Manually adjust or reset the counter.'),
            adjustment: new Gtk.Adjustment({
                lower: -999999,
                upper:  999999,
                step_increment: 1,
            }),
        });
        settings.bind('count', countRow, 'value', 0);
        counterGroup.add(countRow);

        // Group: Display
        const displayGroup = new Adw.PreferencesGroup({
            title: _('Display'),
        });
        settingsPage.add(displayGroup);

        const showLabelRow = new Adw.SwitchRow({
            title: _('Show label'),
            subtitle: _('Display label text alongside the count in the top bar.'),
        });
        settings.bind('show-label', showLabelRow, 'active', 0);
        displayGroup.add(showLabelRow);

        const labelTextRow = new Adw.EntryRow({
            title: _('Label text'),
        });
        labelTextRow.set_text(settings.get_string('label-text'));
        labelTextRow.connect('changed', () => {
            settings.set_string('label-text', labelTextRow.get_text());
        });
        settings.connect('changed::label-text', () => {
            const cur = settings.get_string('label-text');
            if (labelTextRow.get_text() !== cur)
                labelTextRow.set_text(cur);
        });
        displayGroup.add(labelTextRow);

        const posGroup = new Adw.PreferencesGroup({
            title: _('Position'),
        });
        settingsPage.add(posGroup);

        const posRightRow = new Adw.SwitchRow({
            title: _('Place on right side'),
            subtitle: _('By default, Tally sits on the left side of the top bar.'),
        });
        settings.bind('position-right', posRightRow, 'active', 0);
        posGroup.add(posRightRow);

        const aboutGroup = new Adw.PreferencesGroup();
        settingsPage.add(aboutGroup);

        const aboutRow = new Adw.ActionRow({
            title: _('About Tally'),
            icon_name: 'help-about-symbolic',
            activatable: true,
        });
        aboutRow.connect('activated', () => {
            const aboutDialog = new Adw.AboutDialog({
                application_name: 'Tally',
                application_icon: 'accessories-calculator-symbolic',
                version: '0.1',
                developer_name: 'Hemish',
                website: 'https://hemish.net',
                comments: 'A minimal click counter in the GNOME top bar. Left-click increments, right-click decrements. Count persists across restarts.',
                license_type: Gtk.License.GPL_3_0,
            });
            aboutDialog.add_link('contact@hemish.net', 'mailto:contact@hemish.net');
            aboutDialog.add_link('hemish04082005@gmail.com', 'mailto:hemish04082005@gmail.com');
            aboutDialog.set_issue_url("https://github.com/imhemish/gnome-extension-tally/issues");

            aboutDialog.present(window);
        });
        aboutGroup.add(aboutRow);
    }
}
