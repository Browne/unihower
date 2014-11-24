/**
 * @file Provides handlers for topic api routes.
 *
 * @example
 *   var topicApiRoutes = require( './routes/api/topics' )( env );
 *   app.get( '/topics/:id', topicApiRoutes.get );
 *
 * @license https://www.mozilla.org/MPL/2.0/ MPL-2.0
 *
 * @requires ../../models
 * @requires ../errors
 */

module.exports = function( env ) {
  var db = require( '../../models' )( env );
  var errorResponse = require( '../errors' )( env );

  return {
    /**
     * Create a new topic.
     *
     * Once a topic is created it is automatically associated to the user that
     * created it.
     *
     * Note: `req.body` must be an object containing the data for the new topic.
     *
     * @param  {http.IncomingMessage} req
     * @param  {http.ServerResponse} res
     */
    create: function( req, res ) {
      return db.Topic.create( req.body ).done( function( err, topic ) {
        if( err ) {
          return errorResponse.internal( req, res, err );
        }

        topic.setUser( req.session.user.id ).done( function( err, user ) {
          if( err ) {
            return errorResponse.internal( req, res, err );
          }

          res.status( 200 ).json( topic );
        });
      });
    },
    /**
     * Get a specific topics details.
     *
     * Only the user who's details are being requested, can retrieve the topic details.
     *
     * Note: `req.params.id` must be the id for the topic to fetch.
     *
     * @param  {http.IncomingMessage} req
     * @param  {http.ServerResponse} res
     */
    get: function( req, res ) {
      return db.Topic.find( req.params.id ).done( function( err, topic ) {
        if( err ) {
          return errorResponse.internal( req, res, err );
        }

        if( topic.UserId !== req.session.user.id ) {
          return errorResponse.forbidden( req, res );
        }

        res.status( 200 ).json( topic );
      });
    },
    /**
     * Returns a 403 forbidden instead of all topic listing.
     *
     * This function is here as a placeholder for consistency in the API. No
     * user should be able to access anothers topic details.
     *
     * @param  {http.IncomingMessage} req
     * @param  {http.ServerResponse} res
     */
    list: function( req, res ) {
      return errorResponse.forbidden( req, res );
    },
    /**
     * Update a specific topics details.
     *
     * Only the user who's details are being updated can modify details.
     *
     * Note: `req.body` must be an object containing the data for the new topic, and
     * `req.params.id` must be the id for the topic to update.
     *
     * @param  {http.IncomingMessage} req
     * @param  {http.ServerResponse} res
     */
    update: function( req, res ) {
      return db.Topic.find( req.params.id ).done( function( err, topic ) {
        if( err ) {
          return errorResponse.internal( req, res, err );
        }

        if( topic.UserId !== req.session.user.id ) {
          return errorResponse.forbidden( req, res, err );
        }

        topic.updateAttributes( req.body ).done( function( err, topic ) {
          if( err ) {
            return errorResponse.internal( req, res, err );
          }

          res.status( 200 ).json( topic );
        });
      });
    },
    /**
     * Delete a specific topic.
     *
     * Only the user who's topic details will be removed, may remove the specified topic.
     *
     * Note: `req.params.id` must be the id for the topic to delete.
     *
     * @param  {http.IncomingMessage} req
     * @param  {http.ServerResponse} res
     */
    delete: function( req, res ) {
      return db.Topic.find( req.params.id ).done( function( err, topic ) {
        if( err ) {
          return errorResponse.internal( req, res, err );
        }

        if( topic.UserId !== req.session.user.id ) {
          return errorResponse.forbidden( req, res );
        }

        topic.destroy().done( function( err ) {
          if( err ) {
            return errorResponse.internal( req, res, err );
          }

          res.status( 204 ).end();
        });
      });
    },
    /**
     * Lists all the tasks that belong to a specific topic.
     *
     * @param  {http.IncomingMessage} req
     * @param  {http.ServerResponse} res
     */
    tasks: function( req, res ) {
      return db.Topic.find({
        where: {
          id: req.params.id
        },
        include: [ db.Task ]
      }).done( function( err, topic ) {
        if( err ) {
          console.log( err );
          return errorResponse.internal( req, res, err );
        }

        if( topic.UserId !== req.session.user.id ) {
          return errorResponse.forbidden( req, res );
        }

        res.status( 200 ).json( topic.Tasks );
      });
    }
  };
};
