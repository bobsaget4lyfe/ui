import React from 'react';
import PropTypes from 'prop-types';
import Heading from 'components/Heading';
import {
  ReferenceArea,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  LineChart,
  CartesianGrid,
  ReferenceLine,
  Legend,
  Label, ResponsiveContainer,
} from 'recharts';
import constants from 'components/constants';
import strings from 'lang';
import heroes from 'dotaconstants/build/heroes.json';
import playerColors from 'dotaconstants/build/player_colors.json';
import { StyledTooltip, StyledTooltipTeam, StyledRadiant, StyledDire, StyledHolder, GoldSpan, XpSpan, StyledTooltipGold } from './Styled';

const formatGraphTime = minutes => `${minutes}:00`;

const generateDiffData = (match) => {
  const { radiant_gold_adv, radiant_xp_adv } = match;
  const data = [];
  radiant_xp_adv.forEach((rXpAdv, index) => {
    data.push({ time: index, rXpAdv, rGoldAdv: radiant_gold_adv[index] });
  });
  return data;
};

const XpTooltipContent = ({ payload }) => {
  try {
    const data = payload && payload[0] && payload[0].payload;
    const { rXpAdv, rGoldAdv, time } = data;
    return (
      <StyledTooltip>
        <StyledTooltipGold>
          <span>{`${formatGraphTime(time)}`}</span>
        </StyledTooltipGold>
        <br />
        <StyledTooltipGold>
          <StyledTooltipTeam
            color={rGoldAdv > 0 ? constants.colorSuccess : constants.colorDanger}
          >
            {rGoldAdv > 0 ? strings.general_radiant : strings.general_dire}
          </StyledTooltipTeam>
          <GoldSpan>{Math.abs(rGoldAdv)} {strings.heading_graph_gold}</GoldSpan>
        </StyledTooltipGold>
        <br />
        <StyledTooltipGold>
          <StyledTooltipTeam
            color={rXpAdv > 0 ? constants.colorSuccess : constants.colorDanger}
          >
            {rXpAdv > 0 ? strings.general_radiant : strings.general_dire}
          </StyledTooltipTeam>
          <XpSpan>{Math.abs(rXpAdv)} {strings.heading_graph_xp}</XpSpan>
        </StyledTooltipGold>
      </StyledTooltip>
    );
  } catch (e) {
    return null;
  }
};
XpTooltipContent.propTypes = {
  payload: PropTypes.shape({}),
};

const XpNetworthGraph = ({ match }) => {
  const matchData = generateDiffData(match);
  const maxY =
      Math.ceil(Math.max(...match.radiant_gold_adv, ...match.radiant_xp_adv) / 5000) * 5000;
  const minY =
      Math.floor(Math.min(...match.radiant_gold_adv, ...match.radiant_xp_adv) / 5000) * 5000;
  return (
    <StyledHolder>
      <StyledRadiant>{strings.general_radiant}</StyledRadiant>
      <StyledDire>{strings.general_dire}</StyledDire>
      <Heading title={strings.heading_graph_difference} />
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={matchData}
          margin={{
            top: 5, right: 30, left: 30, bottom: 5,
          }}
        >
          <ReferenceArea y1={0} y2={maxY} fill="rgba(102, 187, 106, 0.12)" />
          <ReferenceArea y1={0} y2={minY} fill="rgba(255, 76, 76, 0.12)" />
          <XAxis dataKey="time" interval={4} tickFormatter={formatGraphTime}>
            <Label value={strings.th_time} position="insideTopRight" />
          </XAxis>
          <YAxis domain={[minY, maxY]} />
          <ReferenceLine y={0} stroke="#505050" strokeWidth={2} opacity={1} />
          <CartesianGrid
            stroke="#505050"
            strokeWidth={1}
            opacity={0.5}
          />

          <Tooltip content={<XpTooltipContent />} />
          <Line
            dot={false}
            dataKey="rXpAdv"
            stroke="#acc9ed"
            strokeWidth={2}
            name={strings.heading_graph_xp}
          />
          <Line
            dot={false}
            dataKey="rGoldAdv"
            stroke="#ffd455"
            strokeWidth={2}
            name={strings.heading_graph_gold}
          />
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    </StyledHolder>
  );
};
XpNetworthGraph.propTypes = {
  match: PropTypes.shape({}),
};

class PlayersGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hoverHero: null,
    };

    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  handleMouseEnter(o) {
    this.setState({
      hoverHero: o.dataKey,
    });
  }

  handleMouseLeave() {
    this.setState({
      hoverHero: null,
    });
  }

  render() {
    const { match, type } = this.props;
    const { hoverHero } = this.state;

    const matchData = [];
    if (match.players && match.players[0] && match.players[0][`${type}_t`]) {
      match.players[0][`${type}_t`].forEach((value, index) => {
        const obj = { time: formatGraphTime(index) };
        match.players.forEach((player) => {
          const hero = heroes[player.hero_id] || {};
          obj[hero.localized_name] = player[`${type}_t`][index];
        });
        matchData.push(obj);
      });

      return (
        <StyledHolder>
          <Heading title={strings[`heading_graph_${type}`]} />
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={matchData}
              margin={{
                top: 5, right: 30, left: 30, bottom: 5,
              }}
            >
              <XAxis dataKey="time" interval={4} >
                <Label value={strings.th_time} position="insideTopRight" />
              </XAxis>
              <YAxis />
              <CartesianGrid
                stroke="#505050"
                strokeWidth={1}
                opacity={0.5}
              />

              <Tooltip
                itemSorter={(a, b) => a.value < b.value}
                wrapperStyle={{ backgroundColor: constants.darkPrimaryColor, border: 'none' }}
              />
              {match.players.map((player) => {
                const hero = heroes[player.hero_id] || {};
                const playerColor = playerColors[player.player_slot];
                const isSelected = heroes[player.hero_id] && (hoverHero === heroes[player.hero_id].localized_name);
                const opacity = (!hoverHero || isSelected) ? 1 : 0.25;
                const stroke = (isSelected) ? 4 : 2;
                return (<Line
                  dot={false}
                  dataKey={hero.localized_name}
                  stroke={playerColor}
                  strokeWidth={stroke}
                  strokeOpacity={opacity}
                  name={hero.localized_name}
                />);
              })}
              <Legend onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} />
            </LineChart>
          </ResponsiveContainer>
        </StyledHolder>
      );
    }

    return null;
  }
}
PlayersGraph.propTypes = {
  match: PropTypes.shape({}),
  type: PropTypes.string,
};

const MatchGraph = ({ type, match, width }) => {
  if (type === 'difference') {
    return <XpNetworthGraph match={match} width={width} />;
  } else if (type === 'gold' || type === 'xp' || type === 'lh') {
    return <PlayersGraph type={type} match={match} width={width} />;
  }
  return null;
};
MatchGraph.defaultProps = {
  width: 1200,
};
MatchGraph.propTypes = {
  width: PropTypes.number,
  match: PropTypes.shape({}),
  type: PropTypes.string,
};

export default MatchGraph;
