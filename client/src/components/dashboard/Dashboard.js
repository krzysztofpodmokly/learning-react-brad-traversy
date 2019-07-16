import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getCurrentProfile } from '../../actions/profile';
import Spinner from '../layout/Spinner';

const Dashboard = ({ auth }) => {
  useEffect(() => {
    getCurrentProfile();
  }, []);

  console.log(auth);

  return <div />;
};

Dashboard.propTypes = {
  getCurrentProfile: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  auth: state.auth,
  profile: state.profile
});

// const mapStateToProps = (state, ownProps) => {
//   console.log(state);
//   return {};
// };

export default connect(
  mapStateToProps,
  { getCurrentProfile }
)(Dashboard);
