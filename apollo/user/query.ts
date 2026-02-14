import { gql } from "@apollo/client";

/******************
 *    MEMBERS    *
 *****************/

export const GET_MEMBER = gql`
  query GetMember($input: String!) {
    getMember(memberId: $input) {
      _id
      memberNick
      memberType
      memberStatus
      memberPhone
      memberImage
      memberGender
      memberArticles
      memberFollowers
      memberLikes
      memberFollowings
      memberComments
      memberWarnings
      memberBlocks
      isActive
      lastLogin
      bloodGroup
      allergies
      chronicDiseases
      doctorProfile
      createdAt
      updatedAt
      accessToken
      meLiked {
        memberId
        likeRefId
        myFavorite
      }
      meFollowed {
        followingId
        followerId
        myFollowing
      }
    }
  }
`;

/******************
 *    DOCTORS    *
 *****************/

export const GET_DOCTORS = gql`
  query GetDoctors($input: DoctorsInquiry!) {
    getDoctors(input: $input) {
      list {
        _id
        memberNick
        memberType
        memberPhone
        memberImage
        memberGender
        createdAt
        updatedAt
        accessToken
        memberFullName
        licenseNumber
        specialization
        experience
        consultationFee
        languages
        doctorViews
        reviewCount
        memberDesc
        memberArticles
        memberFollowers
        memberFollowings
        memberComments
        memberWarnings
        memberBlocks
        memberLikes
        clinicAddress
        clinicName
        workingDays
        workingHours
        breakTime
        meLiked {
          memberId
          likeRefId
          myFavorite
        }
        memberStatus
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_DOCTOR = gql`
  query GetDoctor($input: String!) {
    getDoctor(doctorId: $input) {
      _id
      memberNick
      memberFullName
      memberPhone
      memberDesc
      licenseNumber
      specialization
      experience
      consultationFee
      memberType
      memberGender
      languages
      memberImage
      accessToken
      clinicAddress
      clinicName
      workingDays
      workingHours
      breakTime
      doctorViews
      reviewCount
      createdAt
      updatedAt
      memberArticles
      memberFollowers
      memberFollowings
      memberComments
      memberWarnings
      memberBlocks
      memberLikes
      meLiked {
        memberId
        likeRefId
        myFavorite
      }
      meFollowed {
        followingId
        followerId
        myFollowing
      }
    }
  }
`;

export const GET_VISITED_DOCTORS = gql`
  query GetVisitedDoctors($input: OrdinaryInquiry!) {
    getVisitedDoctors(input: $input) {
      list {
        _id
        memberNick
        memberStatus
        memberFullName
        memberPhone
        memberDesc
        memberArticles
        memberFollowers
        memberFollowings
        memberComments
        memberWarnings
        memberBlocks
        memberLikes
        licenseNumber
        specialization
        experience
        consultationFee
        memberType
        memberGender
        languages
        memberImage
        accessToken
        clinicAddress
        clinicName
        workingDays
        workingHours
        breakTime
        doctorViews
        reviewCount
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
    }
  }
`;

/*********************
 *    APPOINTMENT    *
 ********************/

export const GET_MEMBER_APPOINTMENTS = gql`
  query GetMyAppointments($input: AppointmentsInquiry!) {
    getMyAppointments(input: $input) {
      list {
        _id
        patient
        doctor
        appointmentDate
        consultationType
        status
        reason
        symptoms
        notes
        consultationFee
        paymentStatus
        paidAt
        meetingLink
        meetingId
        followUpDate
        cancelledBy
        cancellationReason
        cancelledAt
        reminderSent
        completedAt
        duration
        createdAt
        updatedAt
        timeSlot {
          start
          end
        }
        patientData {
          _id
          memberNick
          memberType
          memberStatus
          memberPhone
          memberImage
          memberGender
          isActive
          lastLogin
          bloodGroup
          allergies
          chronicDiseases
          doctorProfile
          createdAt
          updatedAt
          accessToken
          memberAddress {
            street
            city
            state
            country
            zipCode
            coordinates {
              lat
              lng
            }
          }
          emergencyContact {
            name
            relationship
            phone
          }
        }
        doctorData {
          _id
          memberNick
          memberFullName
          memberPhone
          memberDesc
          licenseNumber
          specialization
          experience
          consultationFee
          memberType
          memberGender
          languages
          memberImage
          accessToken
          clinicAddress
          clinicName
          workingDays
          workingHours
          breakTime
          doctorViews
          reviewCount
          createdAt
          updatedAt
        }
      }
      metaCounter {
        total
      }
    }
  }
`;

/******************
 *    ARTICLES    *
 *****************/

export const GET_BOARD_ARTICLES = gql`
  query GetBoardArticles($input: BoardArticlesInquiry!) {
    getBoardArticles(input: $input) {
      list {
        _id
        articleCategory
        articleStatus
        articleTitle
        articleContent
        articleImage
        articleViews
        articleLikes
        articleComments
        memberId
        createdAt
        updatedAt
        meLiked {
          memberId
          likeRefId
          myFavorite
        }
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_BOARD_ARTICLE = gql`
  query GetBoardArticle($input: String!) {
    getBoardArticle(articleId: $input) {
      _id
      articleCategory
      articleStatus
      articleTitle
      articleContent
      articleImage
      articleViews
      articleLikes
      articleComments
      memberId
      createdAt
      updatedAt
      meLiked {
        memberId
        likeRefId
        myFavorite
      }
    }
  }
`;

/******************
 *    COMMENTS    *
 *****************/

export const GET_COMMENTS = gql`
  query GetComments($input: CommentsInquiry!) {
    getComments(input: $input) {
      list {
        _id
        commentStatus
        commentGroup
        commentContent
        commentRefId
        parentCommentId
        commentReplies
        commentLikes
        memberId
        createdAt
        updatedAt
        replies {
          _id
          commentStatus
          commentGroup
          commentContent
          commentRefId
          parentCommentId
          commentReplies
          commentLikes
          memberId
          createdAt
          updatedAt
          memberData {
            _id
            memberNick
            memberType
            memberStatus
            memberPhone
            memberImage
            memberGender
            memberArticles
            memberFollowers
            memberFollowings
            memberComments
            memberWarnings
            memberBlocks
            isActive
            lastLogin
            bloodGroup
            allergies
            chronicDiseases
            doctorProfile
            createdAt
            updatedAt
            accessToken
          }
        }
        memberData {
          _id
          memberNick
          memberType
          memberStatus
          memberPhone
          memberImage
          memberGender
          memberArticles
          memberFollowers
          memberFollowings
          memberComments
          memberWarnings
          memberBlocks
          isActive
          lastLogin
          bloodGroup
          allergies
          chronicDiseases
          doctorProfile
          createdAt
          updatedAt
          accessToken
        }
      }
      metaCounter {
        total
      }
    }
  }
`;

/*****************
 *    FOLLOWS    *
 ****************/

export const GET_MEMBER_FOLLOWINGS = gql`
  query GetMemberFollowings($input: FollowInquiry!) {
    getMemberFollowings(input: $input) {
      list {
        _id
        followingId
        followerId
        createdAt
        updatedAt
        followingData {
          _id
          memberNick
          memberType
          memberPhone
          memberImage
          memberGender
          memberArticles
          memberFollowers
          memberLikes
          memberFollowings
          memberComments
          memberWarnings
          memberBlocks
          doctorProfile
          createdAt
          updatedAt
          accessToken
        }
        meLiked {
          memberId
          likeRefId
          myFavorite
        }
        meFollowed {
          followingId
          followerId
          myFollowing
        }
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_MEMBER_FOLLOWERS = gql`
  query GetMemberFollowers($input: FollowInquiry!) {
    getMemberFollowers(input: $input) {
      list {
        _id
        followingId
        followerId
        createdAt
        updatedAt
        followerData {
          _id
          memberNick
          memberType
          memberPhone
          memberImage
          memberGender
          memberArticles
          memberFollowers
          memberLikes
          memberFollowings
          memberComments
          memberWarnings
          memberBlocks
          doctorProfile
          createdAt
          updatedAt
          accessToken
        }
        meLiked {
          memberId
          likeRefId
          myFavorite
        }
        meFollowed {
          followingId
          followerId
          myFollowing
        }
      }
      metaCounter {
        total
      }
    }
  }
`;

