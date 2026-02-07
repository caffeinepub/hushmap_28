import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

module {
  // Legacy types from old system
  type LegacyNoiseLevel = {
    #Quiet;
    #Moderate;
    #Buzzing;
  };

  type LegacyWifiSpeed = {
    #Slow;
    #Okay;
    #Fast;
  };

  type LegacyLocationType = {
    #Cafe;
    #Library;
    #CoworkingSpace;
  };

  type LegacyProfile = {
    name : Text;
  };

  type LegacyRating = {
    noiseLevel : LegacyNoiseLevel;
    wifiSpeed : LegacyWifiSpeed;
    description : ?Text;
    userId : Principal;
    createdAt : Int;
    updatedAt : Int;
    editCount : Nat;
  };

  type LegacyLocation = {
    osmNodeId : Text;
    name : Text;
    locationType : LegacyLocationType;
    lat : Float;
    lng : Float;
    address : ?Text;
    ratings : [LegacyRating];
  };

  type LegacyOldActor = {
    locations : Map.Map<Text, LegacyLocation>;
    userProfiles : Map.Map<Principal, LegacyProfile>;
    MAX_RATINGS : Nat;
    MAX_NAME_LENGTH : Nat;
    MAX_ADDRESS_LENGTH : Nat;
    MAX_DESCRIPTION_LENGTH : Nat;
  };

  // New types
  type NewUserRole = { #buyer; #seller; #admin };
  type NewUserProfile = { name : Text; email : Text; phone : ?Text; role : NewUserRole };

  type NewOldActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(legacy : LegacyOldActor) : NewOldActor {
    let newUserProfiles = legacy.userProfiles.map<Principal, LegacyProfile, NewUserProfile>(
      func(_userId, legacyProfile) {
        {
          legacyProfile with
          email = "unknown";
          phone = null;
          role = #buyer;
        };
      }
    );
    { userProfiles = newUserProfiles };
  };
};
