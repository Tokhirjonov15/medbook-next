import { gql } from "@apollo/client";

/******************
 *    MEMBERS    *
 *****************/

export const SIGN_UP = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      _id
      memberNick
      memberType
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
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
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

export const UPDATE_MEMBER = gql`
  mutation UpdateMember($input: MemberUpdate!) {
    updateMember(input: $input) {
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

/******************
 *    DOCTORS    *
 *****************/

export const LIKE_TARGET_DOCTOR = gql`
  mutation LikeTargetDoctor($input: String!) {
    likeTargetDoctor(memberId: $input) {
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
  }
`;

/*********************
 *    APPOINTMENT    *
 ********************/

export const BOOK_APPOINTMENT = gql`
  mutation BookAppointment($input: BookAppointmentInput!) {
    bookAppointment(input: $input) {
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
  }
`;

export const UPDATE_APPOINTMENT = gql`
  mutation UpdateAppointment($input: AppointmentUpdate!) {
    updateAppointment(input: $input) {
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
        memberAddress {
          street
          city
          state
          country
          zipCode
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
        memberArticles
        memberFollowers
        memberFollowings
        memberComments
        memberWarnings
        memberBlocks
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
  }
`;

export const CANCEL_APPOINTMENT = gql`
  mutation CancelAppointment($appointmentId: String!, $reason: String!) {
    cancelAppointment(appionmentId: $appointmentId, reason: $reason) {
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
  }
`;

/******************
 *    PAYMENTS    *
 *****************/

export const CREATE_PAYMENT = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      _id
      appointment
      patient
      doctor
      amount
      platformFee
      doctorAmount
      paymentMethod
      status
      refundRequestReason
      refundRequestedAt
      refundedBy
      refundReason
      refundedAt
      paidAt
      createdAt
      updatedAt
    }
  }
`;

export const REQUEST_REFUND = gql`
  mutation RequestForRefund($input: RequestRefundInput!) {
    requestForRefund(input: $input) {
      _id
      appointment
      patient
      doctor
      amount
      platformFee
      doctorAmount
      paymentMethod
      status
      refundRequestReason
      refundRequestedAt
      refundedBy
      refundReason
      refundedAt
      paidAt
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
