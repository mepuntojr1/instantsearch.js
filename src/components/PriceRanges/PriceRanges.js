import React from 'react';

import Template from '../Template.js';
import PriceRangesForm from './PriceRangesForm.js';
import cx from 'classnames';
import isEqual from 'lodash/isEqual';

import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';

export class RawPriceRanges extends React.Component {
  componentWillMount() {
    this.refine = this.refine.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props.facetValues, nextProps.facetValues);
  }

  getForm() {
    const labels = {
      currency: this.props.currency,
      ...this.props.labels,
    };

    let currentRefinement;
    if (this.props.facetValues.length === 1) {
      currentRefinement = {
        from: this.props.facetValues[0].from !== undefined ? this.props.facetValues[0].from : '',
        to: this.props.facetValues[0].to !== undefined ? this.props.facetValues[0].to : '',
      };
    } else {
      currentRefinement = {from: '', to: ''};
    }

    return (
      <PriceRangesForm
        cssClasses={this.props.cssClasses}
        currentRefinement={currentRefinement}
        labels={labels}
        refine={this.refine}
      />
    );
  }

  getItemFromFacetValue(facetValue) {
    const cssClassItem = cx(
      this.props.cssClasses.item,
      {[this.props.cssClasses.active]: facetValue.isRefined}
    );
    const key = `${facetValue.from}_${facetValue.to}`;
    const handleClick = this.refine.bind(this, facetValue);
    const data = {
      currency: this.props.currency,
      ...facetValue,
    };
    return (
      <div className={cssClassItem} key={key}>
        <a
          className={this.props.cssClasses.link}
          href={facetValue.url}
          onClick={handleClick}
        >
          <Template data={data} templateKey="item" {...this.props.templateProps} />
        </a>
      </div>
    );
  }

  refine(range, event) {
    event.preventDefault();
    this.props.refine(range);
  }

  render() {
    return (
      <div>
        <div className={this.props.cssClasses.list}>
          {this.props.facetValues.map(facetValue => this.getItemFromFacetValue(facetValue))}
        </div>
        {this.getForm()}
      </div>
    );
  }
}

RawPriceRanges.propTypes = {
  cssClasses: React.PropTypes.shape({
    active: React.PropTypes.string,
    button: React.PropTypes.string,
    form: React.PropTypes.string,
    input: React.PropTypes.string,
    item: React.PropTypes.string,
    label: React.PropTypes.string,
    link: React.PropTypes.string,
    list: React.PropTypes.string,
    separator: React.PropTypes.string,
  }),
  currency: React.PropTypes.string,
  facetValues: React.PropTypes.array,
  labels: React.PropTypes.shape({
    button: React.PropTypes.string,
    to: React.PropTypes.string,
  }),
  refine: React.PropTypes.func.isRequired,
  templateProps: React.PropTypes.object.isRequired,
};

RawPriceRanges.defaultProps = {
  cssClasses: {},
};

export default autoHideContainerHOC(headerFooterHOC(RawPriceRanges));