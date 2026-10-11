#include "furlong/market_replay.hpp"

namespace furlong {

ReplayResult replay(const std::vector<MarketEvent>& events) {
    MatchingEngine engine;
    ReplayResult result;

    for (const MarketEvent& ev : events) {
        if (ev.type == EventType::NewOrder) {
            auto t = engine.submit(ev.order);
            result.trades.insert(result.trades.end(), t.begin(), t.end());
        } else {
            if (!engine.cancel(ev.cancel_id)) ++result.cancels_rejected;
        }
        ++result.events_processed;
    }
    return result;
}

}  // namespace furlong