const AWS = require('aws-sdk');
const axios = require('axios');

// Configure AWS
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

class FederationRegistry {
  /**
   * Register a user globally when they create account
   */
  static async registerUserGlobally(userData) {
    const params = {
      TableName: 'brixton-global-users',
      Item: {
        email: userData.email,
        username: userData.username,
        user_id: userData.id,
        instance_url: process.env.INSTANCE_URL, // e.g., https://brixton-instance-a.com
        instance_name: process.env.INSTANCE_NAME || 'Unknown',
        full_name: userData.full_name,
        created_at: new Date().toISOString(),
        status: 'active'
      }
    };

    try {
      await dynamodb.put(params).promise();
      console.log(`✅ User ${userData.email} registered globally`);
      return true;
    } catch (error) {
      console.error('❌ Failed to register globally:', error);
      return false;
    }
  }

  /**
   * Search for a user globally (across all instances)
   */
  static async searchGlobally(searchTerm) {
    try {
      // Search by email or username
      const emailParams = {
        TableName: 'brixton-global-users',
        FilterExpression: 'contains(email, :term) OR contains(username, :term)',
        ExpressionAttributeValues: {
          ':term': searchTerm.toLowerCase()
        },
        Limit: 20
      };

      const result = await dynamodb.scan(emailParams).promise();
      return result.Items;
    } catch (error) {
      console.error('❌ Global search failed:', error);
      return [];
    }
  }

  /**
   * Find specific user globally
   */
  static async findUserGlobally(email) {
    try {
      const params = {
        TableName: 'brixton-global-users',
        Key: { email }
      };

      const result = await dynamodb.get(params).promise();
      return result.Item || null;
    } catch (error) {
      console.error('❌ Find user failed:', error);
      return null;
    }
  }

  /**
   * Send friend request across instances
   */
  static async sendCrossInstanceFriendRequest(senderUserId, senderEmail, recipientEmail) {
    try {
      // Find recipient globally
      const recipient = await this.findUserGlobally(recipientEmail);
      if (!recipient) {
        throw new Error('User not found');
      }

      // If on same instance, use local request
      if (recipient.instance_url === process.env.INSTANCE_URL) {
        console.log('📍 User on same instance - using local request');
        return { local: true };
      }

      // If different instance, send to remote instance
      console.log(`🌐 Sending request to ${recipient.instance_url}`);

      const response = await axios.post(
        `${recipient.instance_url}/api/federation/receive-friend-request`,
        {
          sender_email: senderEmail,
          sender_instance: process.env.INSTANCE_URL,
          recipient_user_id: recipient.user_id
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.FEDERATION_SECRET}`
          }
        }
      );

      return { remote: true, response: response.data };
    } catch (error) {
      console.error('❌ Cross-instance friend request failed:', error.message);
      throw error;
    }
  }

  /**
   * Send message across instances
   */
  static async sendCrossInstanceMessage(senderUserId, senderEmail, recipientEmail, content) {
    try {
      const recipient = await this.findUserGlobally(recipientEmail);
      if (!recipient) {
        throw new Error('Recipient not found');
      }

      // If same instance, use local message
      if (recipient.instance_url === process.env.INSTANCE_URL) {
        return { local: true };
      }

      // Send to remote instance
      const response = await axios.post(
        `${recipient.instance_url}/api/federation/receive-message`,
        {
          sender_email: senderEmail,
          sender_instance: process.env.INSTANCE_URL,
          recipient_user_id: recipient.user_id,
          content: content,
          timestamp: new Date().toISOString()
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.FEDERATION_SECRET}`
          }
        }
      );

      return { remote: true, response: response.data };
    } catch (error) {
      console.error('❌ Cross-instance message failed:', error.message);
      throw error;
    }
  }

  /**
   * Get user's friends across all instances
   */
  static async getFriendsAcrossInstances(userId, instanceUrl) {
    // TODO: Implement to combine local friends + remote friends
    return [];
  }

  /**
   * Get all instances (for network discovery)
   */
  static async getAllInstances() {
    try {
      const params = {
        TableName: 'brixton-global-users',
        ProjectionExpression: 'instance_url, instance_name'
      };

      const result = await dynamodb.scan(params).promise();
      
      // Get unique instances
      const instances = new Map();
      result.Items.forEach((item) => {
        instances.set(item.instance_url, item.instance_name);
      });

      return Array.from(instances.entries()).map(([url, name]) => ({
        url,
        name
      }));
    } catch (error) {
      console.error('❌ Failed to get instances:', error);
      return [];
    }
  }
}

module.exports = FederationRegistry;
