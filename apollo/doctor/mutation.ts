import { gql } from "@apollo/client";

/******************
 *     DOCTORS    *
 *****************/

export const DOCTOR_SIGNUP = gql`
  mutation DoctorSignup($input: DoctorSignupInput!) {
    doctorSignup(input: $input) {
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
      workingDays
      workingHours
      breakTime
      doctorViews
      reviewCount
      createdAt
      updatedAt
      clinicAddress
      clinicName
    }
  }
`;

export const DOCTOR_LOGIN = gql`
  mutation DoctorLogin($input: LoginInput!) {
    DoctorLogin(input: $input) {
      _id
      memberNick
      memberFullName
      memberPhone
      licenseNumber
      specialization
      experience
      consultationFee
      memberType
      memberGender
      languages
      memberImage
      accessToken
      doctorViews
      reviewCount
      createdAt
      updatedAt
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      message
      success
    }
  }
`;

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input) {
      message
      success
    }
  }
`;

export const LIKE_TARGET_MEMBER = gql`
  mutation LikeTargetMember($input: String!) {
    likeTargetMember(memberId: $input) {
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
    }
  }
`;

export const UPDATE_DOCTOR = gql`
  mutation UpdateDoctor($input: DoctorUpdate!) {
    updateDoctor(input: $input) {
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
`;

/******************
 *    ARTICLES    *
 *****************/

export const CREATE_BOARD_ARTICLE = gql`
  mutation CreateBoardArticle($input: BoardArticleInput!) {
    createBoardArticle(propertyId: $input) {
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
    }
  }
`;

export const UPDATE_BOARD_ARTICLE = gql`
  mutation UpdateBoardArticle($input: BoardArticleUpdate!) {
    updateBoardArticle(input: $input) {
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
    }
  }
`;

export const LIKE_TARGET_BOARD_ARTICLE = gql`
  mutation LikeTargetBoardArticle($input: String!) {
    likeTargetBoardArticle(articleId: $input) {
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
    }
  }
`;

/******************
 *    COMMENTS    *
 *****************/

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CommentInput!) {
    createComment(input: $input) {
      _id
      commentStatus
      commentGroup
      commentContent
      commentRefId
      parentCommentId
      commentReplies
      memberId
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($input: CommentUpdate!) {
    updateComment(input: $input) {
      _id
      commentStatus
      commentGroup
      commentContent
      commentRefId
      parentCommentId
      commentReplies
      memberId
      createdAt
      updatedAt
    }
  }
`;

export const LIKE_TARGET_COMMENT = gql`
  mutation LikeTargetComment($input: String!) {
    likeTargetComment(memberId: $input) {
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
    }
  }
`;

/*****************
 *    FOLLOWS    *
 ****************/

export const SUBSCRIBE_MEMBER = gql`
  mutation SubscribeMember($input: String!) {
    subscribeMember(input: $input) {
      _id
      followingId
      followerId
      createdAt
      updatedAt
    }
  }
`;

export const UNSUBSCRIBE_MEMBER = gql`
  mutation UnsubscribeMember($input: String!) {
    unsubscribeMember(input: $input) {
      _id
      followingId
      followerId
      createdAt
      updatedAt
    }
  }
`;

export const SUBSCRIBE_DOCTOR = gql`
  mutation SubscribeDoctor($input: String!) {
    subscribeDoctor(input: $input) {
      _id
      followingId
      followerId
      createdAt
      updatedAt
    }
  }
`;

export const UNSUBSCRIBE_DOCTOR = gql`
  mutation UnsubscribeDoctor($input: String!) {
    unsubscribeDoctor(input: $input) {
      _id
      followingId
      followerId
      createdAt
      updatedAt
    }
  }
`;
