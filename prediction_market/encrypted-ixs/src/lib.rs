use arcis_imports::*;

#[encrypted]
mod circuits {
    use arcis_imports::*;

    pub struct VoteStats {
        yes_votes: u8,
        no_votes: u8,
    }

    pub struct BetPrediction {
        prediction: bool,
        amount: u64,
    }

    pub struct QuorumVote {
        vote: bool,
    }

    pub struct ResolutionResult {
        outcome: bool,
        yes_votes: u8,
        no_votes: u8,
    }

    pub struct BetPayout {
        payout_amount: u64,
        won: bool,
    }

    pub struct PoolUpdate {
        yes_pool_delta: u64,
        no_pool_delta: u64,
    }

    #[instruction]
    pub fn initialize_market(mxe: Mxe) -> Enc<Mxe, VoteStats> {
        let vote_stats = VoteStats {
            yes_votes: 0,
            no_votes: 0,
        };
        mxe.from_arcis(vote_stats)
    }

    #[instruction]
    pub fn place_bet(prediction_ctxt: Enc<Shared, bool>, amount: u64) -> PoolUpdate {
        let prediction = prediction_ctxt.to_arcis();

        let yes_delta = if prediction { amount } else { 0 };
        let no_delta = if !prediction { amount } else { 0 };

        PoolUpdate {
            yes_pool_delta: yes_delta,
            no_pool_delta: no_delta,
        }
        .reveal()
    }

    #[instruction]
    pub fn submit_quorum_vote(
        vote_ctxt: Enc<Shared, QuorumVote>,
        vote_stats_ctxt: Enc<Mxe, VoteStats>,
    ) -> Enc<Mxe, VoteStats> {
        let vote = vote_ctxt.to_arcis();
        let mut vote_stats = vote_stats_ctxt.to_arcis();

        if vote.vote {
            vote_stats.yes_votes += 1;
        } else {
            vote_stats.no_votes += 1;
        }

        vote_stats_ctxt.owner.from_arcis(vote_stats)
    }

    #[instruction]
    pub fn resolve_market(
        vote_stats_ctxt: Enc<Mxe, VoteStats>,
        _quorum_size: u8,
    ) -> ResolutionResult {
        let vote_stats = vote_stats_ctxt.to_arcis();

        let outcome = vote_stats.yes_votes > vote_stats.no_votes;

        ResolutionResult {
            outcome,
            yes_votes: vote_stats.yes_votes,
            no_votes: vote_stats.no_votes,
        }
        .reveal()
    }

    #[instruction]
    pub fn distribute_rewards(
        bet_ctxt: Enc<Shared, bool>,
        market_outcome: bool,
        bet_amount: u64,
        yes_pool: u64,
        no_pool: u64,
    ) -> BetPayout {
        let user_prediction = bet_ctxt.to_arcis();

        let won = user_prediction == market_outcome;

        let payout_amount = if !won {
            0
        } else {
            let winning_pool = if market_outcome { yes_pool } else { no_pool };
            let losing_pool = if market_outcome { no_pool } else { yes_pool };

            let profit_ratio = if winning_pool > 0 {
                (losing_pool * bet_amount) / winning_pool
            } else {
                0
            };

            bet_amount + profit_ratio
        };

        BetPayout { payout_amount, won }.reveal()
    }
}
