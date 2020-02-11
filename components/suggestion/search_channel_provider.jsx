// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {sortChannelsByTypeAndDisplayName} from 'mattermost-redux/utils/channel_utils';

import Provider from './provider.jsx';
import SearchChannelSuggestion from './search_channel_suggestion';

export default class SearchChannelProvider extends Provider {
    constructor(channelSearchFunc) {
        super();
        this.autocompleteChannelsForSearch = channelSearchFunc;
    }

    handlePretextChanged(pretext, resultsCallback) {
        const captured = (/\b(?:in|channel):\s*(\S*)$/i).exec(pretext.toLowerCase());
        if (captured) {
            const channelPrefix = captured[1];

            this.startNewRequest(channelPrefix);

            this.autocompleteChannelsForSearch(
                channelPrefix,
                (data) => {
                    if (this.shouldCancelDispatch(channelPrefix)) {
                        return;
                    }

                    //
                    // MM-12677 When this is migrated this needs to be fixed to pull the user's locale
                    //
                    const channels = data.sort(sortChannelsByTypeAndDisplayName.bind(null, 'en'));
                    const channelNames = channels.map(itemToTerm);

                    resultsCallback({
                        matchedPretext: channelPrefix,
                        terms: channelNames,
                        items: channels,
                        component: SearchChannelSuggestion,
                    });
                },
            );
        }

        return Boolean(captured);
    }
}
